import { NextRequest, NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { completion, getPromptTemplate } from '@/src/lib/openai';

export async function POST(request: NextRequest) {
    const wixClient = getServerWixClient();

    try {
        const body = await request.json();
        const { messages, threadId } = body;
        console.log('Received request:', { messageCount: messages?.length, threadId });
        console.log('First message:', messages?.[0]);
        console.log('Last message:', messages?.[messages?.length - 1]);

        console.log("ARNT", JSON.stringify(body, null, 2))

        if (!messages || !messages.length) {
            console.log('No messages provided:', messages);
            return NextResponse.json(
                { error: 'No message provided' },
                { status: 400 }
            );
        }

        // Normalize messages to use text field
        const normalizedMessages = messages.map(msg => ({
            ...msg,
            text: msg.text || msg.content, // Handle both text and content fields
            role: 'user' // All messages from frontend are user messages now
        }));

        // Get thread history if it exists
        let threadHistory: any[] = [];
        if (threadId) {
            const { items } = await wixClient.items
                .query('gptthread')
                .eq('_id', threadId)
                .find();

            if (items.length > 0) {
                threadHistory = items[0].thread || [];
                // Correct roles in thread history to match OpenAI's expected roles
                threadHistory = threadHistory.map(message => ({
                    ...message,
                    role: message.role === 'Agent' ? 'assistant' : 'user'
                }));
            }
        }

        // Combine thread history with new message
        const allMessages = [...threadHistory, ...normalizedMessages];

        console.log('Message history:', {
            threadHistory: threadHistory.length,
            newMessages: normalizedMessages.length,
            total: allMessages.length
        });

        // Get the default prompt template
        const promptTemplate = getPromptTemplate('DEFAULT');
        if (!promptTemplate) {
            console.error('No prompt template found');
            throw new Error('No prompt template found');
        }
        console.log('Using prompt template:', promptTemplate.id);

        // Start with the system message
        const conversationHistory: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            {
                role: "system",
                content: promptTemplate.systemPrompt
            }
        ];

        // Get the last 6 pairs from thread history (12 messages total)
        const lastMessages = allMessages.slice(-12);

        // Add messages to conversation history
        for (let i = 0; i < lastMessages.length; i++) {
            const msg = lastMessages[i];
            console.log(`Adding message ${i}:`, {
                role: msg.role,
                preview: msg.text.substring(0, 50) + '...'
            });
            conversationHistory.push({
                role: msg.role === 'Agent' ? 'assistant' : 'user',
                content: msg.text
            });
        }

        console.log('Final conversation history:', {
            messageCount: conversationHistory.length,
            messages: conversationHistory.map(m => ({ role: m.role, contentPreview: m.content.substring(0, 50) + '...' }))
        });

        // Get completion using our lib
        console.log('Requesting completion from OpenAI...');
        const responseMessage = await completion(conversationHistory);

        if (!responseMessage) {
            console.error('No response received from OpenAI');
            throw new Error('No response from OpenAI');
        }
        console.log('Received response from OpenAI:', responseMessage.substring(0, 50) + '...');

        // Create the assistant's message in the DB format
        const now = new Date();
        // Format: DD/MM/YYYY, HH:mm:ss
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
            _id: `msg-${allMessages.length * 2}`,
            role: 'user',
            text: normalizedMessages[normalizedMessages.length - 1].text,
            time: formattedDate
        };

        // Create the assistant's message
        const assistantMessage = {
            _id: `msg-${allMessages.length * 2 + 1}`,
            role: 'Agent',
            text: responseMessage,
            time: formattedDate,
            datetime: now.toISOString(),
            public: false
        };
        console.log('Created assistant message:', { id: assistantMessage._id });

        // Save the chat if user is authenticated
        if (wixClient.auth.loggedIn()) {
            console.log('User is authenticated, saving chat...');
            try {
                let savedThreadId = threadId;

                if (threadId) {
                    console.log('Updating existing thread:', threadId);
                    // Update existing thread
                    const { items } = await wixClient.items
                        .query('gptthread')
                        .eq('_id', threadId)
                        .find();

                    if (items.length > 0) {
                        const existingThread = items[0];
                        console.log('Found existing thread:', {
                            id: existingThread._id,
                            messageCount: existingThread.thread?.length
                        });
                        await wixClient.items.update('gptthread', {
                            _id: threadId,
                            thread: [...(existingThread.thread || []), userMessage, assistantMessage]
                        });
                        console.log('Thread updated successfully');
                    } else {
                        console.log('Thread not found:', threadId);
                    }
                } else {
                    console.log('Creating new thread');
                    const result = await wixClient.items.insert('gptthread', {
                        question: normalizedMessages[1].text.substring(0, 100) + '...',
                        thread: [userMessage, assistantMessage],
                        public: false,
                        personality: "CALVIN"
                    });
                    savedThreadId = result._id;
                    console.log('New thread created successfully with ID:', savedThreadId);
                }

                console.log('Sending response to client with threadId:', savedThreadId);
                return NextResponse.json({
                    _id: assistantMessage._id,
                    role: 'Agent',
                    text: responseMessage,
                    time: formattedDate,
                    datetime: now.toISOString(),
                    public: true,
                    threadId: savedThreadId
                });
            } catch (error) {
                console.error('Error saving chat:', error);
                // Continue even if saving fails
            }
        }

        console.log('Sending response to client without threadId');
        return NextResponse.json({
            _id: assistantMessage._id,
            role: 'Agent',
            text: responseMessage,
            time: formattedDate,
            datetime: now.toISOString(),
            public: true
        });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
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
