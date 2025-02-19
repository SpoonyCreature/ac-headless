import { VertexAI, SchemaType } from '@google-cloud/vertexai';
import { AIProvider } from './base';
import { CompletionOptions, Message, JsonSchemaFormat } from './types';
import { Source } from '@/src/types/chat';

interface GroundingChunk {
    retrievedContext: {
        uri: string;
        title: string;
        content: string;  // Gemini actually returns content, not text
    };
}

interface GroundingSupport {
    segment: {
        startIndex: number;
        endIndex: number;
        text: string;
    };
    groundingChunkIndices: number[];
    confidenceScores: number[];
}

interface CompletionResponse {
    text: string;
    sources?: Source[];
    groundingSupports?: GroundingSupport[];
}

export class GeminiProvider extends AIProvider {
    private vertexAI: VertexAI;
    private textModel: string;
    private project: string;
    private location: string;

    constructor(projectId: string, location: string = 'us-central1', modelName: string = 'gemini-1.5-flash-001') {
        super('not-needed'); // API key not needed for Vertex AI as it uses GCP auth
        this.project = projectId;
        this.location = location;
        this.textModel = modelName;

        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
            throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable');
        }

        // Initialize Vertex AI with service account credentials
        this.vertexAI = new VertexAI({
            project: this.project,
            location: this.location,
            googleAuthOptions: {
                credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
                scopes: ['https://www.googleapis.com/auth/cloud-platform']
            }
        });
    }

    private convertJsonSchemaToGeminiSchema(jsonSchema: JsonSchemaFormat): any {
        const schema = jsonSchema.json_schema.schema;

        const convertProperty = (prop: any): any => {
            if (prop.type === 'string') {
                return {
                    type: SchemaType.STRING,
                    description: prop.description,
                    enum: prop.enum,
                    nullable: false,
                };
            } else if (prop.type === 'number') {
                return {
                    type: SchemaType.NUMBER,
                    description: prop.description,
                    nullable: false,
                };
            } else if (prop.type === 'boolean') {
                return {
                    type: SchemaType.BOOLEAN,
                    description: prop.description,
                    nullable: false,
                };
            } else if (prop.type === 'array') {
                return {
                    type: SchemaType.ARRAY,
                    description: prop.description,
                    items: convertProperty(prop.items),
                };
            } else if (prop.type === 'object') {
                return {
                    type: SchemaType.OBJECT,
                    description: prop.description,
                    properties: Object.fromEntries(
                        Object.entries(prop.properties).map(([key, value]) => [
                            key,
                            convertProperty(value)
                        ])
                    ),
                    required: prop.required,
                };
            }
            return prop;
        };

        return convertProperty(schema);
    }

    private formatReferencesAsMarkdown(text: string): string {

        // First, handle comma-separated references with numbers
        text = text.replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (match, numbers) => {
            const refs = numbers.split(/\s*,\s*/).map(num => `[ref${num.trim()}]`);
            return refs.join(' ');
        });

        // Then handle any remaining single number references
        text = text.replace(/\[(\d+)\]/g, (match, num) => {
            const ref = `[ref${num}]`;
            return ref;
        });

        // Handle any malformed references
        text = text
            .replace(/\[ref(\d+)\}/g, '[ref$1]')
            .replace(/\{ref(\d+)\}/g, '[ref$1]')
            .replace(/\[#ref(\d+)\]\(#ref\d+\)/g, '[ref$1]');

        return text;
    }

    async completion(
        messages: Message[],
        options: CompletionOptions = {}
    ): Promise<CompletionResponse | string> {
        const {
            temperature = 0.7,
            top_p,
            stop,
            response_format = 'text',
            tools
        } = options;
        const generationConfig: any = {
            temperature,
            topP: top_p,
            stopSequences: stop,
        };
        if (response_format !== 'text') {
            generationConfig.responseMimeType = 'application/json';
            generationConfig.responseSchema = this.convertJsonSchemaToGeminiSchema(response_format);
        }
        // Find system message if it exists
        const systemMessage = messages.find(msg => msg.role === 'system');

        // Get the model
        const model = this.vertexAI.preview.getGenerativeModel({
            model: "gemini-1.5-flash-001",
            generationConfig,
            systemInstruction: systemMessage?.content as string
        })

        console.log('Generation config:', JSON.stringify(generationConfig, null, 2));

        // Prepare the messages
        const contents = [
            ...(systemMessage ? [{
                role: 'user',
                parts: [{ text: systemMessage.content as string }]
            }] : []),
            ...messages
                .filter(msg => msg.role !== 'system')
                .map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content as string }]
                }))
        ];

        const request = {
            contents,
            tools
        };

        console.log('Request to Gemini:', JSON.stringify(request, null, 2));

        // Generate content
        const result = await model.generateContent(request);
        const response = await result.response;

        console.log('Result from Gemini:', JSON.stringify(result, null, 2));
        console.log('Response from Gemini:', JSON.stringify(response, null, 2));

        if (response_format !== 'text') {
            try {
                return JSON.parse(response.candidates?.[0]?.content?.parts?.[0]?.text || '');
            } catch (error) {
                throw new Error('Failed to parse JSON response from Gemini');
            }
        }

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
            throw new Error('No response generated from Gemini');
        }

        const candidate = candidates[0];

        let text = candidate.content?.parts[0]?.text;

        if (!text) {
            throw new Error('Invalid response format from Gemini');
        }

        // Format references in the text
        text = this.formatReferencesAsMarkdown(text);

        // If the response has grounding metadata with supports, return a structured response
        if (candidate.groundingMetadata?.groundingSupports) {
            console.log('Found grounding supports:', JSON.stringify(candidate.groundingMetadata.groundingSupports, null, 2));

            // Extract grounding supports if available
            const groundingSupports = candidate.groundingMetadata.groundingSupports?.filter(support =>
                support?.segment?.startIndex != null &&
                support?.segment?.endIndex != null &&
                support?.segment?.text != null &&
                support?.groundingChunkIndices != null &&
                support?.confidenceScores != null
            ).map(support => ({
                segment: {
                    startIndex: support.segment!.startIndex!,
                    endIndex: support.segment!.endIndex!,
                    text: support.segment!.text!
                },
                groundingChunkIndices: support.groundingChunkIndices!,
                confidenceScores: support.confidenceScores!
            })) as GroundingSupport[];

            console.log('Extracted groundingSupports:', JSON.stringify(groundingSupports, null, 2));

            // Get all unique chunk indices from the supports
            const uniqueChunkIndices = new Set(groundingSupports.flatMap(s => s.groundingChunkIndices));
            const chunks = candidate.groundingMetadata!.groundingChunks;
            if (!chunks) {
                console.log('No chunks found in metadata');
                return { text };
            }

            // Create sources from the grounding chunks
            const sources = Array.from(uniqueChunkIndices).map((chunkIndex): Source => {
                const chunk = chunks[chunkIndex];
                if (!chunk?.retrievedContext) {
                    console.log(`No retrievedContext for chunk ${chunkIndex}`);
                    return {
                        id: `ref${chunkIndex + 1}`,
                        title: 'Unknown Source',
                        uri: '',
                        text: ''
                    };
                }
                const context = chunk.retrievedContext as { uri: string; title: string; text: string };
                return {
                    id: `ref${chunkIndex + 1}`,
                    title: context.title || 'Unknown Source',
                    uri: context.uri || '',
                    text: context.text || '' // Use the full chunk text
                };
            });

            console.log('Created sources:', JSON.stringify(sources, null, 2));

            const finalResult = {
                text,
                sources,
                groundingSupports
            };

            console.log('Final result structure:', {
                text: typeof text,
                sourcesLength: sources.length,
                groundingSupportsLength: groundingSupports?.length
            });

            return finalResult;
        } else {
            console.log('No grounding metadata found in response');
            return text;
        }
    }
} 
