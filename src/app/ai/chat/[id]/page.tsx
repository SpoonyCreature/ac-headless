'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatSidebar } from '@/src/components/ChatSidebar';
import { ChatMessage } from '@/src/components/ChatMessage';
import { Chat as ChatType } from '@/src/types/chat';
import { useRouter } from 'next/navigation';

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
        return <div>Loading...</div>;
    }

    if (!currentChat) {
        return <div>Chat not found</div>;
    }

    const isOwnChat = currentUserId && currentChat._owner === currentUserId;

    return (
        <div className="flex h-screen bg-background">
            <ChatSidebar chats={chats} currentChatId={params.id} currentUserId={currentUserId} />
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    {currentChat.thread.map((message) => (
                        <ChatMessage
                            key={message._id}
                            message={message}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                {!isOwnChat && (
                    <div className="p-4 border-t border-border">
                        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
                            This is a read-only view of the chat. You can start your own chat from the sidebar.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 
