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
    options: { temperature?: number; model?: string } = {}
) {
    const response = await openai.chat.completions.create({
        model: options.model || 'gpt-4o-mini',
        temperature: options.temperature || 0.7,
        messages: messages,
        stream: false,
    });

    return response.choices[0].message.content;
} 
