import { Chat } from '@/src/types/chat';
import { MessageSquare, Plus, Lock, Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TransitionLink } from './TransitionLink';
import { cn } from '@/src/lib/utils';

interface ChatSidebarProps {
    privateChats: Chat[];
    publicChats: Chat[];
    currentChatId?: string;
    currentUserId?: string;
    isLoading?: boolean;
    isAuthenticated?: boolean;
    showSidebar?: boolean;
    onCloseSidebar?: () => void;
}

export function ChatSidebar({ privateChats = [], publicChats = [], currentChatId, currentUserId, isLoading = false, isAuthenticated, showSidebar, onCloseSidebar }: ChatSidebarProps) {
    const [showMorePrivate, setShowMorePrivate] = useState(false);
    const [showMorePublic, setShowMorePublic] = useState(false);

    const initialPrivateChats = privateChats.slice(0, 5);
    const remainingPrivateChats = privateChats.slice(5);
    const initialPublicChats = publicChats.slice(0, 5);
    const remainingPublicChats = publicChats.slice(5);

    if (isLoading) {
        return (
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-80 lg:w-80 lg:relative",
                "transform transition-transform duration-300 ease-in-out",
                "bg-background border-r border-border",
                "lg:opacity-100 lg:pointer-events-auto",
                showSidebar ? "translate-x-0 opacity-100 pointer-events-auto" : "-translate-x-full opacity-0 pointer-events-none lg:translate-x-0"
            )}>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">Your Chats</h3>
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="px-3 py-2 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="w-4 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted-foreground/20 rounded w-3/4 animate-pulse" />
                                            <div className="h-3 bg-muted-foreground/20 rounded w-1/4 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">Public Chats</h3>
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="px-3 py-2 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="w-4 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted-foreground/20 rounded w-3/4 animate-pulse" />
                                            <div className="h-3 bg-muted-foreground/20 rounded w-1/4 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Overlay */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={onCloseSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-80 lg:w-80 lg:relative",
                "transform transition-transform duration-300 ease-in-out",
                "bg-background border-r border-border",
                "lg:opacity-100 lg:pointer-events-auto",
                showSidebar ? "translate-x-0 opacity-100 pointer-events-auto" : "-translate-x-full opacity-0 pointer-events-none lg:translate-x-0"
            )}>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {privateChats.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">Your Chats</h3>
                            <div className="space-y-1">
                                {initialPrivateChats.map((chat) => (
                                    <TransitionLink
                                        key={chat._id}
                                        href={`/study/chat/${chat._id}`}
                                        className={cn(
                                            'flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted',
                                            chat._id === currentChatId && 'bg-muted'
                                        )}
                                    >
                                        <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm truncate">{chat.question}</span>
                                                <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {chat._createdDate && formatDistanceToNow(new Date(chat._createdDate))} ago
                                            </p>
                                        </div>
                                    </TransitionLink>
                                ))}
                                {remainingPrivateChats.length > 0 && (
                                    <>
                                        {showMorePrivate && remainingPrivateChats.map((chat) => (
                                            <TransitionLink
                                                key={chat._id}
                                                href={`/study/chat/${chat._id}`}
                                                className={cn(
                                                    'flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted',
                                                    chat._id === currentChatId && 'bg-muted'
                                                )}
                                            >
                                                <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-sm truncate">{chat.question}</span>
                                                        <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {chat._createdDate && formatDistanceToNow(new Date(chat._createdDate))} ago
                                                    </p>
                                                </div>
                                            </TransitionLink>
                                        ))}
                                        <button
                                            onClick={() => setShowMorePrivate(!showMorePrivate)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                                        >
                                            <ChevronDown className={`w-4 h-4 transition-transform ${showMorePrivate ? 'rotate-180' : ''}`} />
                                            {showMorePrivate ? 'Show Less' : `Show ${remainingPrivateChats.length} More`}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {publicChats.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">Public Chats</h3>
                            <div className="space-y-1">
                                {initialPublicChats.map((chat) => (
                                    <TransitionLink
                                        key={chat._id}
                                        href={`/study/chat/${chat._id}`}
                                        className={cn(
                                            'flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted',
                                            chat._id === currentChatId && 'bg-muted'
                                        )}
                                    >
                                        <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm truncate">{chat.question}</span>
                                                <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {chat._createdDate && formatDistanceToNow(new Date(chat._createdDate))} ago
                                            </p>
                                        </div>
                                    </TransitionLink>
                                ))}
                                {remainingPublicChats.length > 0 && (
                                    <>
                                        {showMorePublic && remainingPublicChats.map((chat) => (
                                            <TransitionLink
                                                key={chat._id}
                                                href={`/study/chat/${chat._id}`}
                                                className={cn(
                                                    'flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted',
                                                    chat._id === currentChatId && 'bg-muted'
                                                )}
                                            >
                                                <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-sm truncate">{chat.question}</span>
                                                        <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {chat._createdDate && formatDistanceToNow(new Date(chat._createdDate))} ago
                                                    </p>
                                                </div>
                                            </TransitionLink>
                                        ))}
                                        <button
                                            onClick={() => setShowMorePublic(!showMorePublic)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                                        >
                                            <ChevronDown className={`w-4 h-4 transition-transform ${showMorePublic ? 'rotate-180' : ''}`} />
                                            {showMorePublic ? 'Show Less' : `Show ${remainingPublicChats.length} More`}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {!isLoading && privateChats.length === 0 && publicChats.length === 0 && (
                        <div className="px-3 py-8 text-center text-muted-foreground">
                            <p>No chats yet</p>
                            <p className="text-sm mt-1">Start a new chat to see it here</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
} 