import { NextResponse } from 'next/server';
import { Message, completion } from '@/src/lib/ai';
import { ChatMessage, Source, GroundingSupport } from '@/src/types/chat';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { generateChatNote, shouldGenerateNoteForChat } from '@/src/lib/user-notes';

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
    const wixClient = getServerWixClient();

    try {
        const { messages, threadId } = await request.json();

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

                    Please respond in simple markdown, concisely, in paragraph form, like you would type a message.
                    
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

        // Format the current time
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formattedDate = now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }) + ', ' + now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        // Create the user's message in the DB format
        const userMessage = {
            _id: `msg-${Date.now()}-user`,
            role: 'user',
            text: messages[messages.length - 1].content,
            time: formattedTime,
            datetime: now.toISOString()
        };

        // Create the AI response message
        const responseMessage = typeof response === 'object' && 'text' in response
            ? {
                _id: `msg-${Date.now()}`,
                role: 'Agent',
                text: (response as CompletionResponse).text,
                sources: (response as CompletionResponse).sources,
                groundingSupports: (response as CompletionResponse).groundingSupports,
                time: formattedTime,
                datetime: now.toISOString()
            }
            : {
                _id: `msg-${Date.now()}`,
                role: 'Agent',
                text: response as string,
                time: formattedTime,
                datetime: now.toISOString()
            };

        const completionResponse = typeof response === 'object' && 'text' in response
            ? response as CompletionResponse
            : { text: response as string };

        // Save the chat if user is authenticated
        if (wixClient.auth.loggedIn()) {
            try {
                let savedThreadId = threadId;
                let updatedThread;

                // If we have a threadId, try to update existing thread
                if (threadId) {
                    const { items } = await wixClient.items
                        .query('gptthread')
                        .eq('_id', threadId)
                        .find();

                    if (items.length > 0) {
                        const existingThread = items[0];
                        updatedThread = [...(existingThread.thread || []), userMessage, responseMessage];

                        await wixClient.items.update('gptthread', {
                            _id: existingThread._id,
                            question: existingThread.question,
                            personality: existingThread.personality || "REFORMED",
                            thread: updatedThread
                        });
                    } else {
                        console.error('Thread not found:', threadId);
                        // If thread not found, create a new one
                        savedThreadId = null;
                    }
                }

                // If no threadId or thread not found, create a new thread
                if (!savedThreadId) {
                    updatedThread = [userMessage, responseMessage];
                    const result = await wixClient.items.insert('gptthread', {
                        question: messages[messages.length - 1].content.substring(0, 100) + '...',
                        thread: updatedThread,
                        public: false,
                        personality: "REFORMED"
                    });
                    savedThreadId = result._id;
                }

                // Generate note if needed
                if (shouldGenerateNoteForChat(updatedThread.length)) {
                    try {
                        await generateChatNote(
                            updatedThread,
                            completionResponse.sources
                        );
                    } catch (error) {
                        console.error('Failed to generate chat note:', error);
                        // Continue even if note generation fails
                    }
                }

                // Return the response with threadId
                return NextResponse.json({
                    ...responseMessage,
                    threadId: savedThreadId
                });
            } catch (error) {
                console.error('Error saving chat:', error);
                // Continue even if saving fails
            }
        }

        // Return the response without threadId if not authenticated
        return NextResponse.json(responseMessage);
    } catch (error) {
        console.error('Error in PDF chat:', error);
        return NextResponse.json(
            { error: 'Failed to process chat with knowledge base' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    const wixClient = getServerWixClient();

    if (!wixClient.auth.loggedIn()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { items } = await wixClient.items
            .query('gptthread')
            .descending('_createdDate')
            .find();

        return NextResponse.json({ chats: items });
    } catch (error) {
        console.error('Error fetching chats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}