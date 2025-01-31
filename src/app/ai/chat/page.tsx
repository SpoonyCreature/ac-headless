'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatSidebar } from '@/src/components/ChatSidebar';
import { ChatMessage } from '@/src/components/ChatMessage';
import { ChatInput } from '@/src/components/ChatInput';
import { Chat as ChatType } from '@/src/types/chat';
import { useRouter } from 'next/navigation';

interface Message {
    _id: string;
    role: 'user' | 'Agent';
    text: string;
    time: string;
    public?: boolean;
}

export default function ChatPage() {
    const [privateChats, setPrivateChats] = useState<ChatType[]>([]);
    const [publicChats, setPublicChats] = useState<ChatType[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [threadId, setThreadId] = useState<string | undefined>(undefined);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        // Add welcome message when component mounts (now always on reload)
        setMessages([{
            _id: 'welcome',
            role: 'Agent',
            text: 'Hello! I am an AI assistant. How can I help you today?',
            time: new Date().toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            })
        }]);
    }, []);

    useEffect(() => {
        // Fetch public chats for everyone
        fetchPublicChats();
        // Fetch private chats only if authenticated
        if (isAuthenticated) {
            fetchPrivateChats();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();
            if (data.user) {
                setCurrentUserId(data.user._id);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            setIsAuthenticated(false);
        }
    };

    const fetchPublicChats = async () => {
        try {
            const response = await fetch('/api/chat/public');
            const data = await response.json();
            if (response.ok) {
                setPublicChats(data.chats);
            }
        } catch (error) {
            console.error('Error fetching public chats:', error);
        }
    };

    const fetchPrivateChats = async () => {
        try {
            const response = await fetch('/api/chat/private');
            const data = await response.json();
            if (response.ok) {
                setPrivateChats(data.chats);
            }
        } catch (error) {
            console.error('Error fetching private chats:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (message: string) => {
        if (!message.trim() || isLoading) return;

        try {
            setIsLoading(true);

            // Add user message immediately
            const userMessage = {
                _id: `msg-${messages.length}`,
                role: 'user' as const,
                text: message.trim(),
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            } satisfies Message;
            setMessages(prev => [...prev, userMessage]);

            console.log("Message being sent:", message);
            console.log("User message object:", userMessage);
            console.log("Current messages state before fetch:", messages);

            // Create the message array to send, including the new user message
            const messagesToSend = [...messages, userMessage].map(m => ({
                role: 'user',
                content: m.text
            }));

            // Send to API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    threadId,
                    messages: messagesToSend
                }),
            });

            console.log("Request body sent:", JSON.stringify({
                threadId,
                messages: messagesToSend
            }));

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            // Store threadId from first response
            if (!threadId && data.threadId) {
                setThreadId(data.threadId);
            }

            // Add AI response
            const aiMessage = {
                _id: data._id,
                role: 'Agent' as const,
                text: data.text,
                time: data.time,
                public: data.public
            } satisfies Message;
            setMessages(prev => [...prev, aiMessage]);

            // Refresh chat lists
            if (isAuthenticated) {
                fetchPrivateChats();
            }
            fetchPublicChats();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background">
            <ChatSidebar
                privateChats={privateChats}
                publicChats={publicChats}
                currentChatId={undefined}
                currentUserId={currentUserId}
            />
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto pb-[140px]">
                    <div className="max-w-3xl mx-auto px-4">
                        {messages.map((message) => (
                            <ChatMessage
                                key={message._id}
                                message={message}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="fixed bottom-0 left-80 right-0 bg-gradient-to-t from-background via-background to-background/0 pt-6 pb-8">
                    <div className="max-w-3xl mx-auto px-4">
                        <ChatInput onSend={handleSend} disabled={isLoading} isAuthenticated={isAuthenticated} />
                    </div>
                </div>
            </div>
        </div>
    );
} 
