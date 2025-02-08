'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatSidebar } from '@/src/components/ChatSidebar';
import { ChatMessage } from '@/src/components/ChatMessage';
import { ChatInput } from '@/src/components/ChatInput';
import { Chat as ChatType } from '@/src/types/chat';
import { useRouter } from 'next/navigation';
import { LoadingMessage } from '@/src/components/LoadingMessage';
import { Menu, X } from 'lucide-react';

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
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        const init = async () => {
            await fetchCurrentUser();
        };
        init();
    }, []);

    useEffect(() => {
        // Fetch public chats for everyone
        const initChats = async () => {
            try {
                await Promise.all([
                    fetchPublicChats(),
                    isAuthenticated ? fetchPrivateChats() : Promise.resolve()
                ]);
            } finally {
                setIsInitialLoad(false);
            }
        };

        initChats();
    }, [isAuthenticated]);

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

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                // Add cache: 'no-store' to prevent caching
                cache: 'no-store',
                // Add credentials to ensure cookies are sent
                credentials: 'same-origin',
                // Add headers to prevent caching
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            const data = await response.json();

            if (data.user) {
                setCurrentUserId(data.user._id);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error fetching current user:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                type: error instanceof Error ? error.constructor.name : typeof error,
                stack: error instanceof Error ? error.stack : undefined
            });
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
        <div className="flex h-screen relative">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden fixed left-4 bottom-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out
                ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <ChatSidebar
                    privateChats={privateChats}
                    publicChats={publicChats}
                    currentUserId={currentUserId}
                    isLoading={isInitialLoad}
                />
            </div>

            {/* Overlay for mobile */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Main chat area */}
            <div className="flex-1 lg:ml-0 flex flex-col h-full relative">
                {/* Messages container with padding bottom for input */}
                <div className="flex-1 overflow-y-auto pb-32">
                    {messages.map((message) => (
                        <ChatMessage
                            key={message._id}
                            message={message}
                        />
                    ))}
                    {isLoading && <LoadingMessage />}
                    <div ref={messagesEndRef} />
                </div>

                {/* Fixed chat input container */}
                <div className="fixed bottom-0 left-0 right-0 lg:left-80 z-20">
                    <div className="bg-gradient-to-t from-background via-background to-transparent h-32 w-full absolute bottom-full pointer-events-none" />
                    <div className="bg-background/80 backdrop-blur-lg border-t border-border/50 p-4 shadow-lg">
                        <div className="max-w-5xl mx-auto">
                            <ChatInput
                                onSend={handleSend}
                                disabled={isLoading}
                                isAuthenticated={isAuthenticated}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
