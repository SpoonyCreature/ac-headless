export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string | PDFContent;
}

export interface JsonSchemaFormat {
    type: "json_schema";
    json_schema: {
        name?: string;
        schema: {
            type: "object";
            properties: Record<string, any>;
            required?: string[];
            additionalProperties?: boolean;
        };
        strict?: boolean;
    };
}

export interface CompletionOptions {
    temperature?: number;
    modelName?: string;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    response_format?: 'text' | JsonSchemaFormat;
    store?: boolean;
    stop?: string[];
    tools?: Array<{
        retrieval?: {
            vertexAiSearch?: {
                datastore: string;
            };
            disableAttribution?: boolean;
        };
    }>;
}

export interface PromptTemplate {
    id: string;
    systemPrompt: string;
    userPrompt: string;
    description?: string;
}

export interface HydratedPrompt {
    systemPrompt: string;
    userPrompt: string;
} 