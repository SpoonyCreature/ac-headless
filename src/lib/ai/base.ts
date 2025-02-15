import { CompletionOptions, Message, PromptTemplate, HydratedPrompt } from './types';

export abstract class AIProvider {
    protected prompts: Record<string, PromptTemplate> = {
        DEFAULT: {
            id: 'DEFAULT',
            systemPrompt: 'You are a helpful AI assistant.',
            userPrompt: '{userInput}',
            description: 'Default conversation prompt'
        }
    };

    constructor(protected apiKey: string) {
        if (!apiKey) {
            throw new Error('Missing API key for AI provider');
        }
    }

    public getPromptTemplate(id: string): PromptTemplate | undefined {
        return this.prompts[id];
    }

    protected hydratePrompt(template: PromptTemplate, variables: Record<string, string>): HydratedPrompt {
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

    abstract completion(
        messages: Message[],
        options?: CompletionOptions
    ): Promise<string | object>;
} 