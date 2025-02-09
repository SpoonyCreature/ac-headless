'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatSidebar } from '@/src/components/ChatSidebar';
import { ChatMessage } from '@/src/components/ChatMessage';
import { ChatInput } from '@/src/components/ChatInput';
import { Chat as ChatType } from '@/src/types/chat';
import { useRouter } from 'next/navigation';
import { LoadingMessage } from '@/src/components/LoadingMessage';
import { Menu, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

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
            const messagesToSend = [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant that can analyze PDFs. Please use the provided PDFs to help answer questions accurately.'
                },
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
                    messages: messagesToSend
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

            // Store threadId from first response
            if (!threadId && data.threadId) {
                setThreadId(data.threadId);
            }

            // Add AI response
            const aiMessage = {
                _id: data._id || `msg-${messages.length + 1}`,
                role: 'Agent' as const,
                text: data.text || data,
                time: data.time || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
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
        <main className="flex min-h-screen bg-gradient-to-b from-background to-background/95">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden fixed left-4 bottom-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-80 transform lg:relative lg:translate-x-0 transition-all duration-300 ease-out",
                showSidebar ? "translate-x-0" : "-translate-x-full"
            )}>
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
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Main chat area */}
            <div className="flex-1 flex flex-col min-h-screen relative">
                {/* Header */}
                <header className="sticky top-0 z-30 flex-none border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="h-14 flex items-center justify-between px-4">
                        <h1 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Chat</h1>
                    </div>
                </header>

                {/* Messages Container - Single Scroll Container */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col min-h-full">
                        <div className="flex-1">
                            {messages.map((message) => (
                                <ChatMessage
                                    key={message._id}
                                    message={message}
                                />
                            ))}
                            {isLoading && <LoadingMessage />}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    </div>
                </div>

                {/* Input Container */}
                <div className="flex-none border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="max-w-3xl mx-auto px-4 py-4">
                        <ChatInput
                            onSend={handleSend}
                            disabled={isLoading}
                            isAuthenticated={isAuthenticated}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
} 
