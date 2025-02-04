import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Types for prompt management
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

// Types for JSON schema response format
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

// Types for completion options
export interface CompletionOptions {
    temperature?: number;
    model?: string;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    response_format?: 'text' | JsonSchemaFormat;
    store?: boolean;
    stop?: string[];
}

// Prompt management
const prompts: Record<string, PromptTemplate> = {
    DEFAULT: {
        id: 'DEFAULT',
        systemPrompt: 'You are a helpful AI assistant.',
        userPrompt: '{userInput}',
        description: 'Default conversation prompt'
    },
    APOLOGETICS: {
        id: 'APOLOGETICS',
        systemPrompt: 'You are a Reformed Presuppositional Apologetics expert, trained to engage in theological and philosophical discussions from a Reformed Christian perspective. Your responses should be grounded in biblical truth and Reformed theology.',
        userPrompt: '{userInput}',
        description: 'Reformed Presuppositional Apologetics expert'
    }
};

export function getPromptTemplate(id: string): PromptTemplate | undefined {
    return prompts[id];
}

export function hydratePrompt(template: PromptTemplate, variables: Record<string, string>): HydratedPrompt {
    let systemPrompt = template.systemPrompt;
    let userPrompt = template.userPrompt;

    // Replace all variables in both prompts
    Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{${key}}`;
        systemPrompt = systemPrompt.replace(new RegExp(placeholder, 'g'), value);
        userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), value);
    });

    return {
        systemPrompt,
        userPrompt
    };
}

export async function completion(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    options: CompletionOptions = {}
) {
    const {
        temperature = 0.7,
        model = 'gpt-4o-mini',
        max_tokens,
        top_p,
        frequency_penalty,
        presence_penalty,
        response_format = 'text',
        store = false,
        stop,
    } = options;

    const completionRequest: any = {
        model,
        temperature,
        messages,
        stream: false,
        store,
    };

    // Add optional parameters if they are provided
    if (max_tokens) completionRequest.max_tokens = max_tokens;
    if (top_p) completionRequest.top_p = top_p;
    if (frequency_penalty) completionRequest.frequency_penalty = frequency_penalty;
    if (presence_penalty) completionRequest.presence_penalty = presence_penalty;
    if (stop) completionRequest.stop = stop;

    // Handle JSON schema response format
    if (response_format !== 'text') {
        completionRequest.response_format = response_format;
    }

    const response = await openai.chat.completions.create(completionRequest);

    if (response_format !== 'text') {
        try {
            return JSON.parse(response.choices[0].message.content || '{}');
        } catch (error) {
            throw new Error('Failed to parse JSON response from OpenAI');
        }
    }

    return response.choices[0].message.content;
} 
