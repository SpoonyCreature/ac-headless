import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { AIProvider, PDFFile } from './base';
import { CompletionOptions, Message, JsonSchemaFormat } from './types';

export class GeminiProvider extends AIProvider {
    private client: GoogleGenerativeAI;
    private fileManager: GoogleAIFileManager;
    private fileCache: Map<string, { uri: string, expiresAt: number }> = new Map(); // displayName -> {uri, expiresAt}

    constructor(apiKey: string) {
        super(apiKey);
        this.client = new GoogleGenerativeAI(apiKey);
        this.fileManager = new GoogleAIFileManager(apiKey);
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

    async completion(
        messages: Message[],
        options: CompletionOptions = {}
    ): Promise<string | object> {
        const {
            temperature = 0.7,
            model: modelName = 'gemini-2.0-flash-lite-preview-02-05',
            top_p,
            stop,
            response_format = 'text'
        } = options;

        const generationConfig: any = {
            temperature,
            topP: top_p,
            stopSequences: stop,
        };

        // Handle structured output if requested
        if (response_format !== 'text') {
            generationConfig.responseMimeType = 'application/json';
            generationConfig.responseSchema = this.convertJsonSchemaToGeminiSchema(response_format);
        }

        // Find system message if it exists
        const systemMessage = messages.find(msg => msg.role === 'system');

        const model = this.client.getGenerativeModel({
            model: modelName,
            generationConfig,
            systemInstruction: systemMessage?.content as string | undefined
        });

        // Filter out system message and prepare chat history
        const chatMessages = messages
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : msg.role,
                parts: typeof msg.content === 'string' ? [{ text: msg.content }] : [msg.content]
            }));

        console.log(`Chat messages: ${JSON.stringify(chatMessages)}`);

        const chat = model.startChat({
            history: chatMessages.slice(0, -1) // Exclude the last message
        });

        // Send the last message
        const lastMessage = chatMessages[chatMessages.length - 1];
        const result = await chat.sendMessage(lastMessage.parts);
        const response = await result.response;
        const text = response.text();

        if (response_format !== 'text') {
            try {
                return JSON.parse(text);
            } catch (error) {
                throw new Error('Failed to parse JSON response from Gemini');
            }
        }

        console.log(`RAW GEMINI RESPONSE: ${JSON.stringify(response)}`);

        return text;
    }

    private async getRemoteFile(displayName: string): Promise<string | null> {
        try {
            // Check in-memory cache first
            const cached = this.fileCache.get(displayName);
            if (cached && Date.now() < cached.expiresAt) {
                return cached.uri;
            }

            // Clear expired cache entry
            if (cached) {
                this.fileCache.delete(displayName);
            }

            // List all files and find matching one
            const files = await this.fileManager.listFiles();
            const matchingFile = files.files.find(f => f.displayName === displayName && f.uri);

            if (matchingFile?.uri) {
                // Store in cache with 48hr expiry
                this.fileCache.set(displayName, {
                    uri: matchingFile.uri,
                    expiresAt: Date.now() + 172800000 // 48 hours in milliseconds
                });
                return matchingFile.uri;
            }

            return null;
        } catch (error) {
            console.error('Error checking remote file:', error);
            return null;
        }
    }

    async uploadPDF(file: PDFFile): Promise<PDFFile> {
        try {
            // Check if file already exists remotely
            const existingUri = await this.getRemoteFile(file.displayName);
            if (existingUri) {
                console.log(`File ${file.displayName} already exists remotely at ${existingUri}`);
                return {
                    ...file,
                    uri: existingUri
                };
            }

            // File doesn't exist, upload it
            const uploadResult = await this.fileManager.uploadFile(
                file.path,
                {
                    mimeType: file.mimeType,
                    displayName: file.displayName,
                }
            );

            // Poll getFile() to check file state
            let uploadedFile = await this.fileManager.getFile(uploadResult.file.name);
            while (uploadedFile.state === 'PROCESSING') {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                uploadedFile = await this.fileManager.getFile(uploadResult.file.name);
            }

            // Cache the new URI with 48hr expiry
            this.fileCache.set(file.displayName, {
                uri: uploadResult.file.uri,
                expiresAt: Date.now() + 172800000 // 48 hours in milliseconds
            });

            return {
                ...file,
                uri: uploadResult.file.uri
            };
        } catch (error) {
            console.error('Error uploading PDF:', error);
            throw new Error('Failed to upload PDF to Gemini');
        }
    }
} 
