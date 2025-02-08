import { AIProvider } from './base';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';

export type AIProviderType = 'openai' | 'gemini';

export class AIProviderFactory {
    private static providers: Map<AIProviderType, AIProvider> = new Map();

    static getProvider(type: AIProviderType): AIProvider {
        if (!this.providers.has(type)) {
            switch (type) {
                case 'openai':
                    if (!process.env.OPENAI_API_KEY) {
                        throw new Error('Missing OPENAI_API_KEY environment variable');
                    }
                    this.providers.set(type, new OpenAIProvider(process.env.OPENAI_API_KEY));
                    break;
                case 'gemini':
                    if (!process.env.GEMINI_API_KEY) {
                        throw new Error('Missing GEMINI_API_KEY environment variable');
                    }
                    this.providers.set(type, new GeminiProvider(process.env.GEMINI_API_KEY));
                    break;
                default:
                    throw new Error(`Unsupported AI provider type: ${type}`);
            }
        }
        return this.providers.get(type)!;
    }

    static clearProviders() {
        this.providers.clear();
    }
} 