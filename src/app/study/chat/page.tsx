'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatSidebar } from '@/src/components/ChatSidebar';
import { ChatMessage } from '@/src/components/ChatMessage';
import { ChatInput } from '@/src/components/ChatInput';
import { Chat as ChatType } from '@/src/types/chat';
import { useRouter } from 'next/navigation';
import { LoadingMessage } from '@/src/components/LoadingMessage';
import { History, Menu } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { usePageTransition } from '@/src/hooks/usePageTransition';

interface Message {
    _id: string;
    role: 'user' | 'Agent';
    text: string;
    time: string;
    public?: boolean;
    sources?: {
        id: string;
        title: string;
        uri: string;
        text: string;
    }[];
    groundingSupports?: {
        segment: {
            startIndex: number;
            endIndex: number;
            text: string;
        };
        groundingChunkIndices: number[];
        confidenceScores: number[];
    }[];
}

export default function ChatPage() {
    const [privateChats, setPrivateChats] = useState<ChatType[]>([]);
    const [publicChats, setPublicChats] = useState<ChatType[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [threadId, setThreadId] = useState<string | undefined>(undefined);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);
    const { isTransitioning } = usePageTransition();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
        // Add welcome message when component mounts
        setMessages([{
            _id: 'welcome',
            role: 'Agent',
            text: 'Welcome to our theological discussion space! I am here to help you explore questions about Reformed theology, doctrine, and faith. How may I assist you today?',
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
        } finally {
            setIsAuthLoading(false);
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
            const messagesToSend = [
                ...messages.map(m => ({
                    role: m.role === 'Agent' ? 'assistant' : 'user',
                    content: m.text
                })),
                {
                    role: 'user',
                    content: userMessage.text
                }
            ];

            // Send to API
            const response = await fetch('/api/chat/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: messagesToSend,
                    threadId
                }),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Add an error message to the chat
                    const errorMessage = {
                        _id: `msg-${messages.length + 1}`,
                        role: 'Agent' as const,
                        text: 'Sorry, I need PDF files in src/lib/ai/knowledge to answer questions. Please add some PDFs to that directory and try again.',
                        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    };
                    setMessages(prev => [...prev, errorMessage]);
                    return;
                }
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            console.log('API Response:', {
                text: data.text,
                sourcesLength: data.sources?.length,
                groundingSupportsLength: data.groundingSupports?.length,
                firstSource: data.sources?.[0],
                firstGroundingSupport: data.groundingSupports?.[0]
            });

            // Store threadId from first response
            if (!threadId && data.threadId) {
                setThreadId(data.threadId);
            }

            // Add AI response
            const aiMessage = {
                _id: `msg-${messages.length + 1}`,
                role: 'Agent' as const,
                text: data.text,
                time: data.time || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                sources: data.sources,
                groundingSupports: data.groundingSupports,
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
        <>
            <style jsx global>{`
                footer {
                    display: none;
                }
            `}</style>
            <main className={cn(
                "flex min-h-screen bg-gradient-to-b from-background to-background/95",
                "transition-opacity duration-300",
                isTransitioning ? "opacity-50" : "opacity-100"
            )}>
                {/* Sidebar */}
                <ChatSidebar
                    privateChats={privateChats}
                    publicChats={publicChats}
                    currentChatId={threadId}
                    currentUserId={currentUserId}
                    isLoading={isInitialLoad}
                    isAuthenticated={isAuthenticated}
                    showSidebar={showSidebar}
                    onCloseSidebar={() => setShowSidebar(false)}
                />

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="bg-primary py-4 px-4 sm:px-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="lg:hidden p-2 -m-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="font-serif text-2xl sm:text-3xl text-primary-foreground">Discussion</h1>
                                <p className="text-primary-foreground/80 text-sm sm:text-base">Explore Reformed theology with source-grounded assistance</p>
                            </div>
                        </div>
                    </header>

                    {/* Messages Container */}
                    <div className="flex-1 pb-40">
                        <div className="max-w-3xl mx-auto px-4">
                            {messages.map((message, index) => (
                                <ChatMessage
                                    key={message._id}
                                    message={message}
                                    isLastMessage={index === messages.length - 1}
                                />
                            ))}
                            {isLoading && <LoadingMessage />}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area - Fixed at Bottom */}
                    <div className="fixed bottom-0 left-0 right-0 lg:left-80 border-t border-border/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50">
                        <div className="max-w-3xl mx-auto p-4">
                            {isAuthLoading ? (
                                <div className="rounded-2xl bg-muted/50 border border-border/50 p-6 backdrop-blur-sm">
                                    <div className="h-8 bg-muted animate-pulse rounded-lg w-48 mx-auto" />
                                </div>
                            ) : (
                                <ChatInput
                                    onSend={handleSend}
                                    disabled={isLoading}
                                    isAuthenticated={isAuthenticated}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
} 
