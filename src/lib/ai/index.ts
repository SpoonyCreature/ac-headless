import { AIProviderFactory } from './factory';
import type { Message, CompletionOptions, PromptTemplate, HydratedPrompt, JsonSchemaFormat } from './types';

// Get the default provider (OpenAI for now)
const defaultProvider = AIProviderFactory.getProvider('gemini');

// Re-export types
export type { Message, CompletionOptions, PromptTemplate, HydratedPrompt, JsonSchemaFormat };

// Prompts management
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

// Export the completion function that uses the default provider
export async function completion(
    messages: Message[],
    options: CompletionOptions = {}
): Promise<string | object> {
    return defaultProvider.completion(messages, options);
}
