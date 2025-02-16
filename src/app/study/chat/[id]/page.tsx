'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/src/components/ChatMessage';
import { Chat as ChatType } from '@/src/types/chat';
import { useRouter } from 'next/navigation';
import { LoadingMessage } from '@/src/components/LoadingMessage';
import { Plus, MessageSquare, Share2, ArrowLeft, Link2, Twitter, Facebook, Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { usePageTransition } from '@/src/hooks/usePageTransition';
import { formatDistanceToNow } from 'date-fns';

export default function ChatViewPage({ params }: { params: { id: string } }) {
    const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>();
    const [isLoading, setIsLoading] = useState(true);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showShareTooltip, setShowShareTooltip] = useState(false);
    const [shareTooltipText, setShareTooltipText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isTransitioning, navigateWithTransition } = usePageTransition();
    const router = useRouter();
    const shareMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (params.id) {
            fetchCurrentChat();
        }
    }, [params.id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setShowShareMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        setShowShareMenu(!showShareMenu);
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setShareTooltipText('Copied to clipboard!');
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
        setShowShareMenu(false);
    };

    const handleShareTwitter = () => {
        const text = currentChat ? `Check out this theological chat: ${currentChat.question || 'Untitled Chat'}` : 'Check out this theological chat';
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        setShowShareMenu(false);
    };

    const handleShareFacebook = () => {
        const url = window.location.href;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        setShowShareMenu(false);
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
                {/* Header Card */}
                <div className="sticky top-0 z-10 p-3 sm:p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative bg-card text-card-foreground rounded-2xl border shadow-sm">
                            {/* Top Section */}
                            <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <button
                                            onClick={() => navigateWithTransition('/study/chat')}
                                            className="flex-none p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div className="min-w-0">
                                            <h1 className="font-semibold text-base sm:text-lg truncate">
                                                {currentChat.question || 'Untitled Chat'}
                                            </h1>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                Read-only theological discussion
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-none">
                                        <div className="relative" ref={shareMenuRef}>
                                            <button
                                                onClick={handleShare}
                                                className="p-2.5 hover:bg-muted rounded-full transition-colors relative"
                                            >
                                                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                            {showShareMenu && (
                                                <div className="absolute right-0 mt-2 w-72 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden z-[60]">
                                                    <div className="px-4 py-3 border-b border-border bg-muted/50">
                                                        <h3 className="font-medium">Share this chat</h3>
                                                        <p className="text-xs text-muted-foreground mt-0.5">Choose how you want to share this conversation</p>
                                                    </div>
                                                    <div className="p-2">
                                                        <button
                                                            onClick={handleCopyLink}
                                                            className="w-full px-3 py-2.5 text-left rounded-xl hover:bg-muted transition-colors flex items-center gap-3 group"
                                                        >
                                                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                                <Link2 className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium">Copy link</div>
                                                                <div className="text-xs text-muted-foreground">Share via URL</div>
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={handleShareTwitter}
                                                            className="w-full px-3 py-2.5 text-left rounded-xl hover:bg-muted transition-colors flex items-center gap-3 group mt-1"
                                                        >
                                                            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                                                <Twitter className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium">Twitter</div>
                                                                <div className="text-xs text-muted-foreground">Share on Twitter</div>
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={handleShareFacebook}
                                                            className="w-full px-3 py-2.5 text-left rounded-xl hover:bg-muted transition-colors flex items-center gap-3 group mt-1"
                                                        >
                                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                                <Facebook className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium">Facebook</div>
                                                                <div className="text-xs text-muted-foreground">Share on Facebook</div>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {showShareTooltip && (
                                                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-popover border border-border text-popover-foreground text-xs rounded-xl shadow-lg whitespace-nowrap flex items-center gap-2 z-[60]">
                                                    <div className="p-1 rounded-full bg-green-500/10">
                                                        <Check className="w-3 h-3 text-green-500" />
                                                    </div>
                                                    {shareTooltipText}
                                                </div>
                                            )}
                                        </div>
                                        <Link
                                            href="/study/chat"
                                            className="inline-flex items-center gap-2 px-3.5 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span className="hidden sm:inline">New Chat</span>
                                            <span className="sm:hidden">New</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {/* Bottom Section - Metadata */}
                            <div className="px-4 sm:px-6 py-3 bg-muted/50 border-t flex items-center gap-3 text-sm text-muted-foreground">
                                <time>{currentChat._createdDate ? formatDistanceToNow(new Date(currentChat._createdDate)) : 'Recently'} ago</time>
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
