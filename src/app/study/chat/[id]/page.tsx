'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/src/components/ChatMessage';
import { Chat as ChatType } from '@/src/types/chat';
import { useRouter } from 'next/navigation';
import { LoadingMessage } from '@/src/components/LoadingMessage';
import { Plus, MessageSquare, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { usePageTransition } from '@/src/hooks/usePageTransition';
import { formatDistanceToNow } from 'date-fns';

export default function ChatViewPage({ params }: { params: { id: string } }) {
    const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>();
    const [isLoading, setIsLoading] = useState(true);
    const [showShareTooltip, setShowShareTooltip] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isTransitioning, navigateWithTransition } = usePageTransition();
    const router = useRouter();

    useEffect(() => {
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

    const fetchCurrentChat = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/chat/${params.id}`);
            const data = await response.json();

            if (!response.ok) {
                console.error('Error fetching chat:', data.error);
                router.push('/study/chat');
                return;
            }

            setCurrentChat(data.chat);

            // If this is the user's own chat, redirect to the chat page
            if (currentUserId && data.chat._owner === currentUserId) {
                router.push('/study/chat');
            }
        } catch (error) {
            console.error('Error fetching current chat:', error);
            router.push('/study/chat');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
    };

    if (isLoading) {
        return (
            <div className={cn(
                "flex min-h-screen bg-gradient-to-b from-background to-background/95",
                "transition-opacity duration-300",
                isTransitioning ? "opacity-50" : "opacity-100"
            )}>
                <div className="flex-1">
                    <div className="p-4 border-t border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                        <div className="max-w-4xl mx-auto">
                            <div className="h-6 w-48 bg-muted-foreground/20 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto py-5">
                        <div className="max-w-4xl mx-auto">
                            <LoadingMessage />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentChat) {
        return (
            <div className={cn(
                "flex min-h-screen bg-gradient-to-b from-background to-background/95 items-center justify-center",
                "transition-opacity duration-300",
                isTransitioning ? "opacity-50" : "opacity-100"
            )}>
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-medium">Chat not found</h2>
                    <p className="text-muted-foreground">This chat may have been deleted or is not publicly accessible.</p>
                    <Link
                        href="/study/chat"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Start New Chat
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex min-h-screen bg-gradient-to-b from-background to-background/95",
            "transition-opacity duration-300",
            isTransitioning ? "opacity-50" : "opacity-100"
        )}>
            <div className="flex-1">
                {/* Header */}
                <div className="p-4 border-t border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigateWithTransition('/study/chat')}
                                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h1 className="font-medium">
                                        {currentChat.question || 'Untitled Chat'}
                                    </h1>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span>Read-only chat</span>
                                        <span>•</span>
                                        <time>{currentChat._createdDate ? formatDistanceToNow(new Date(currentChat._createdDate)) : 'Recently'} ago</time>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleShare}
                                    className="p-2 hover:bg-muted rounded-lg transition-colors relative group"
                                >
                                    <Share2 className="w-5 h-5" />
                                    {showShareTooltip && (
                                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-background border border-border rounded shadow-lg whitespace-nowrap">
                                            Copied to clipboard!
                                        </span>
                                    )}
                                </button>
                                <Link
                                    href="/study/chat"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Chat
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto py-8">
                    <div className="max-w-4xl mx-auto px-4">
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
