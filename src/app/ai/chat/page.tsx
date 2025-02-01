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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

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

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
        <div className="flex h-screen bg-background">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden fixed top-20 left-4 z-30 p-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
            >
                {isSidebarOpen ? (
                    <X className="w-5 h-5" />
                ) : (
                    <Menu className="w-5 h-5" />
                )}
            </button>

            {/* Sidebar with overlay for mobile */}
            <div className={`
                fixed inset-y-16 bg-background/80 backdrop-blur-sm z-20
                transition-opacity duration-200
                md:hidden
                ${isSidebarOpen ? 'opacity-100 inset-x-0' : 'opacity-0 pointer-events-none'}
            `} onClick={() => setIsSidebarOpen(false)} />

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-16 md:top-0 left-0 z-30
                h-[calc(100vh-4rem)] md:h-screen
                w-80 shrink-0
                bg-background border-r border-border/50
                transition-transform duration-200
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <ChatSidebar
                    privateChats={privateChats}
                    publicChats={publicChats}
                    currentChatId={undefined}
                    currentUserId={currentUserId}
                />
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative w-full min-w-0">
                <div className="absolute inset-0 flex flex-col pt-16 md:pt-0">
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
                    <div className="flex-shrink-0 bg-gradient-to-t from-background via-background to-background/0 pt-6 pb-8">
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
