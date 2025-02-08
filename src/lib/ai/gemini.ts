import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { AIProvider } from './base';
import { CompletionOptions, Message, JsonSchemaFormat } from './types';

export class GeminiProvider extends AIProvider {
    private client: GoogleGenerativeAI;

    constructor(apiKey: string) {
        super(apiKey);
        this.client = new GoogleGenerativeAI(apiKey);
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
            model: modelName = 'gemini-2.0-flash',
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

        const model = this.client.getGenerativeModel({
            model: modelName,
            generationConfig
        });

        // Find system message if it exists
        const systemMessage = messages.find(msg => msg.role === 'system');

        // Filter out system message and prepare chat history
        const chatMessages = messages
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : msg.role,
                parts: [{ text: msg.content }]
            }));

        // If there's a system message, prepend it to the user's first message
        if (systemMessage && chatMessages.length > 0 && chatMessages[0].role === 'user') {
            chatMessages[0].parts[0].text = `${systemMessage.content}\n\n${chatMessages[0].parts[0].text}`;
        }

        const chat = model.startChat({
            history: chatMessages.slice(0, -1) // Exclude the last message
        });

        // Send the last message
        const lastMessage = chatMessages[chatMessages.length - 1];
        const result = await chat.sendMessage(lastMessage.parts[0].text);
        const response = await result.response;
        const text = response.text();

        if (response_format !== 'text') {
            try {
                return JSON.parse(text);
            } catch (error) {
                throw new Error('Failed to parse JSON response from Gemini');
            }
        }

        return text;
    }
} 
