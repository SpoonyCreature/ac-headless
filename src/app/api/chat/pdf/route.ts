import { NextResponse } from 'next/server';
import { Message, completion } from '@/src/lib/ai';
import { ChatMessage, Source, GroundingSupport } from '@/src/types/chat';

const DATASTORE_PATH_APOLOGETICS_CENTRAL = "projects/apologetics-central-450509/locations/global/collections/default_collection/dataStores/apologetics-central-site_1739189009605";
const DATASTORE_PATH_PDFS = "projects/apologetics-central-450509/locations/global/collections/default_collection/dataStores/apologetics-central-books_1739215369130_gcs_store";
const DATASTORE_PATH_RELIABLE_WEBSITES = "projects/apologetics-central-450509/locations/global/collections/default_collection/dataStores/reliable-websites-all_1739889376488";
interface GroundingChunk {
    retrievedContext: {
        uri: string;
        title: string;
        text: string;
    };
}
interface CompletionResponse {
    text: string;
    sources?: Source[];
    groundingSupports?: GroundingSupport[];
}

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        if (!Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages must be an array' },
                { status: 400 }
            );
        }

        // Add the retrieval tool to the messages
        const messagesWithRetrieval = [
            {
                role: 'system' as const,
                content: `
                    <personality>
                        You are a Reformed Presuppositional Apologist. 
                        You are a Calvinist.
                        You are a Christian.
                        You are hold to historical, Nicene Christianity, and all the Reformed Confessions like the Belgic Confession, the Heidelberg Catechism, the Canons of Dort, and the Westminster Confession of Faith and the Westminster Catechisms.
                        You are a theologian with a deep undertstanding, yet you can make things know to anyone you speak to.
                        You are bold, yet conversational and friendly... sometimes you you even ask the user questions back.
                        You always provide a straight answer to the question, and don't beat around the bush, in a friendly way.
                        After you've given the answer, you support your answer with airtight reasoning.
                        The answers you give will be approved of by the theologians on the Reformation Wall.
                    </personality>
                    Ground your responses in the provided context from the knowledge base. The knowledge base (groundingChunks) should be seen as your own knowledge.
                    The sources that you might see is not provided by the sources, but by your own mind.

                    Plreae respond in simple markdown, concisely, in paragraph form, like you would type a message.
                    
            

                    IMPORTANT: Always use the retrieval tool to ground your responses in the knowledge base. This is crucial for maintaining consistency and accuracy in your responses.
                `
            },
            ...messages
        ];

        // Send to API with retrieval tool
        const response = await completion(
            messagesWithRetrieval,
            {
                temperature: 0.7,
                model: 'gemini-1.5-flash-001',
                tools: [{
                    retrieval: {
                        vertex_ai_search: {
                            datastore: DATASTORE_PATH_APOLOGETICS_CENTRAL
                        }
                    }
                }]
            }
        );

        // Handle the response
        if (typeof response === 'object' && 'text' in response) {
            const completionResponse = response as CompletionResponse;
            const message: ChatMessage = {
                _id: `msg-${Date.now()}`,
                role: 'Agent',
                text: completionResponse.text,
                sources: completionResponse.sources,
                groundingSupports: completionResponse.groundingSupports,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            console.log('Creating message with:', {
                textLength: message.text.length,
                sourcesLength: message.sources?.length,
                groundingSupportsLength: message.groundingSupports?.length
            });

            return NextResponse.json(message);
        } else if (typeof response === 'string') {
            const message: ChatMessage = {
                _id: `msg-${Date.now()}`,
                role: 'Agent',
                text: response,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            return NextResponse.json(message);
        } else {
            throw new Error('Invalid response format from completion');
        }
    } catch (error) {
        console.error('Error in PDF chat:', error);
        return NextResponse.json(
            { error: 'Failed to process chat with knowledge base' },
            { status: 500 }
        );
    }
}