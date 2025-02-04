'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatSidebar } from '@/src/components/ChatSidebar';
import { ChatMessage } from '@/src/components/ChatMessage';
import { Chat as ChatType } from '@/src/types/chat';
import { useRouter } from 'next/navigation';
import { ChatSkeleton } from '@/src/components/Skeletons';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ChatViewPage({ params }: { params: { id: string } }) {
    const [chats, setChats] = useState<ChatType[]>([]);
    const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>();
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        fetchChats();
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (params.id) {
            fetchCurrentChat();
        }
    }, [params.id]);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();
            if (data.user) {
                setCurrentUserId(data.user._id);
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const fetchChats = async () => {
        try {
            const response = await fetch('/api/chat');
            const data = await response.json();
            if (response.ok) {
                setChats(data.chats);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    const fetchCurrentChat = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/chat/${params.id}`);
            const data = await response.json();

            if (!response.ok) {
                console.error('Error fetching chat:', data.error);
                router.push('/ai/chat');
                return;
            }

            // If this is a public chat, show it
            setCurrentChat(data.chat);

            // If this is the user's own chat, redirect to the chat page
            if (currentUserId && data.chat._owner === currentUserId) {
                router.push('/ai/chat');
            }
        } catch (error) {
            console.error('Error fetching current chat:', error);
            router.push('/ai/chat');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-background">
                <ChatSkeleton />
            </div>
        );
    }

    if (!currentChat) {
        return <div>Chat not found</div>;
    }

    return (
        <div className="flex h-screen bg-background">
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-t border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                Read-only chat view
                            </span>
                            <span className="text-sm font-medium">
                                {currentChat.question || 'Untitled Chat'}
                            </span>
                        </div>
                        <Link
                            href="/ai/chat"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            New Chat
                        </Link>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto py-5">
                    <div className="max-w-4xl mx-auto">
                        {currentChat.thread.map((message) => (
                            <ChatMessage
                                key={message._id}
                                message={message}
                            />
                        ))}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
} 
