import { NextRequest } from 'next/server';
import { ChatMessage, Source, GroundingSupport } from '@/src/types/chat';
import { GeminiProvider } from '@/src/lib/ai/gemini';

interface GeminiResponse {
    candidates?: Array<{
        content: {
            parts: Array<{ text: string }>
        },
        groundingMetadata?: {
            groundingChunks: Array<{
                title?: string;
                content: string;
                uri?: string;
            }>,
            groundingSupports?: Array<{
                segment: {
                    startIndex: number;
                    endIndex: number;
                    text: string;
                };
                groundingChunkIndices: number[];
                confidenceScores: number[];
            }>;
        }
    }>;
}

export async function POST(req: NextRequest) {
    try {
        const { messages, options } = await req.json();

        // Add retrieval tool configuration
        const DATASTORE_PATH = "projects/apologetics-central-450509/locations/global/collections/default_collection/dataStores/apologetics-central-site_1739189009605";

        const toolsWithRetrieval = {
            ...options,
            tools: [{
                retrieval: {
                    vertex_ai_search: {
                        datastore: DATASTORE_PATH

                    }

                }
            }]
        };

        const provider = new GeminiProvider(process.env.GOOGLE_CLOUD_PROJECT || '', process.env.GOOGLE_CLOUD_LOCATION || '');
        const response = await provider.completion(messages, toolsWithRetrieval);

        console.log('Raw response:', JSON.stringify(response, null, 2));

        // Handle structured response with sources and grounding
        if (typeof response === 'object' && 'text' in response) {
            const message: ChatMessage = {
                _id: `msg-${Date.now()}`,
                role: 'Agent',
                text: response.text,
                sources: response.sources,
                groundingSupports: response.groundingSupports,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            console.log('Creating message with:', {
                textLength: message.text.length,
                sourcesLength: message.sources?.length,
                groundingSupportsLength: message.groundingSupports?.length
            });

            return Response.json({ message });
        } else {
            console.log('No structured response found');
            return Response.json({
                message: {
                    _id: `msg-${Date.now()}`,
                    role: 'Agent',
                    text: response as string,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            });
        }
    } catch (error) {
        console.error('Error in chat:', error);
        return Response.json(
            { error: 'Failed to process chat' },
            { status: 500 }
        );
    }
} 
