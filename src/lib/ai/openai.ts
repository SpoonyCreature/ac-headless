import OpenAI from 'openai';
import { AIProvider } from './base';
import { CompletionOptions, Message } from './types';

export class OpenAIProvider extends AIProvider {
    private client: OpenAI;

    constructor(apiKey: string) {
        super(apiKey);
        this.client = new OpenAI({ apiKey });
    }

    async completion(
        messages: Message[],
        options: CompletionOptions = {}
    ): Promise<string | object> {
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

        // Filter out messages with PDF content
        const textOnlyMessages = messages.filter(msg => typeof msg.content === 'string');

        const completionRequest: any = {
            model,
            temperature,
            messages: textOnlyMessages,
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

        const response = await this.client.chat.completions.create(completionRequest);

        if (response_format !== 'text') {
            try {
                return JSON.parse(response.choices[0].message.content || '{}');
            } catch (error) {
                throw new Error('Failed to parse JSON response from OpenAI');
            }
        }

        return response.choices[0].message.content || '';
    }
} 