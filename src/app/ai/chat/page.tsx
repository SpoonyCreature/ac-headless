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
            setIsInitialLoad(false);
        };
        init();
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
        <div className="flex min-h-screen bg-background">
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
                bg-background border-r border-border w-80
                ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <ChatSidebar
                    privateChats={privateChats}
                    publicChats={publicChats}
                    currentChatId={undefined}
                    currentUserId={currentUserId}
                />
            </div>

            {/* Overlay for mobile */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 relative w-full min-w-0">
                <div className="absolute inset-0 flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
                            {isInitialLoad ? (
                                <div className="space-y-4">
                                    <LoadingMessage />
                                </div>
                            ) : (
                                <>
                                    {messages.map((message) => (
                                        <ChatMessage
                                            key={message._id}
                                            message={message}
                                        />
                                    ))}
                                    {isLoading && <LoadingMessage />}
                                </>
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    </div>
                    {/* Input container */}
                    <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-6 pb-6">
                        <div className="max-w-3xl mx-auto px-4">
                            <ChatInput
                                onSend={handleSend}
                                disabled={isLoading || isInitialLoad}
                                isAuthenticated={isAuthenticated}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 
