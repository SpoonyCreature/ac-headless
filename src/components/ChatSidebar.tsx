import { Chat } from '@/src/types/chat';
import { MessageSquare, Plus, Lock, Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TransitionLink } from './TransitionLink';
import { cn } from '@/src/lib/utils';
import { SidebarSkeleton } from './Skeletons';

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
                "lg:opacity-100 lg:pointer-events-auto",
                showSidebar ? "translate-x-0 opacity-100 pointer-events-auto" : "-translate-x-full opacity-0 pointer-events-none lg:translate-x-0"
            )}>
                <SidebarSkeleton />
            </div>
        );
    }

    return (
        <>
            {/* Mobile Overlay */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300"
                    onClick={onCloseSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-[50] w-80 lg:w-80 lg:relative",
                "transform transition-all duration-300 ease-in-out",
                "bg-background/95 backdrop-blur-md",
                "shadow-[8px_0_32px_-12px_rgba(0,0,0,0.12)] dark:shadow-[8px_0_32px_-12px_rgba(0,0,0,0.3)]",
                "lg:opacity-100 lg:pointer-events-auto lg:translate-x-0",
                showSidebar ? "translate-x-0 opacity-100 pointer-events-auto" : "-translate-x-full opacity-0 pointer-events-none"
            )}>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-muted/80 hover:scrollbar-thumb-primary/50 scrollbar-track-transparent">
                    {privateChats.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground/90 mb-3 px-3 flex items-center gap-2 select-none">
                                <div className="p-1 rounded-md bg-muted/50">
                                    <Lock className="w-3.5 h-3.5" />
                                </div>
                                Your Chats
                            </h3>
                            <div className="space-y-1.5">
                                {initialPrivateChats.map((chat) => (
                                    <TransitionLink
                                        key={chat._id}
                                        href={`/study/chat/${chat._id}`}
                                        className={cn(
                                            'group flex items-start gap-3 px-3.5 py-3 rounded-xl',
                                            'hover:bg-muted/80 active:bg-muted/90 transition-all duration-200',
                                            'hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)]',
                                            chat._id === currentChatId && 'bg-muted/90 shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)]'
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-none group-hover:bg-primary/10 transition-colors">
                                            <MessageSquare className="w-4 h-4 text-primary/70" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-medium truncate group-hover:text-primary/90 transition-colors">{chat.question}</span>
                                                <Lock className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary/50 transition-colors shrink-0" />
                                            </div>
                                            <p className="text-xs text-muted-foreground/70 mt-0.5 group-hover:text-muted-foreground transition-colors">
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
                                                    'group flex items-start gap-3 px-3.5 py-3 rounded-xl',
                                                    'hover:bg-muted/80 active:bg-muted/90 transition-all duration-200',
                                                    'hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)]',
                                                    chat._id === currentChatId && 'bg-muted/90 shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)]'
                                                )}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-none group-hover:bg-primary/10 transition-colors">
                                                    <MessageSquare className="w-4 h-4 text-primary/70" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-sm font-medium truncate group-hover:text-primary/90 transition-colors">{chat.question}</span>
                                                        <Lock className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary/50 transition-colors shrink-0" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground/70 mt-0.5 group-hover:text-muted-foreground transition-colors">
                                                        {chat._createdDate && formatDistanceToNow(new Date(chat._createdDate))} ago
                                                    </p>
                                                </div>
                                            </TransitionLink>
                                        ))}
                                        <button
                                            onClick={() => setShowMorePrivate(!showMorePrivate)}
                                            className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full group rounded-lg hover:bg-muted/50"
                                        >
                                            <ChevronDown className={cn(
                                                "w-4 h-4 text-muted-foreground/70 group-hover:text-primary/70 transition-all duration-200",
                                                showMorePrivate && "rotate-180"
                                            )} />
                                            <span className="group-hover:text-primary/90 transition-colors font-medium">
                                                {showMorePrivate ? 'Show Less' : `Show ${remainingPrivateChats.length} More`}
                                            </span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {publicChats.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground/90 mb-3 px-3 flex items-center gap-2 select-none">
                                <div className="p-1 rounded-md bg-muted/50">
                                    <Globe className="w-3.5 h-3.5" />
                                </div>
                                Public Chats
                            </h3>
                            <div className="space-y-1.5">
                                {initialPublicChats.map((chat) => (
                                    <TransitionLink
                                        key={chat._id}
                                        href={`/study/chat/${chat._id}`}
                                        className={cn(
                                            'group flex items-start gap-3 px-3.5 py-3 rounded-xl',
                                            'hover:bg-muted/80 active:bg-muted/90 transition-all duration-200',
                                            'hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)]',
                                            chat._id === currentChatId && 'bg-muted/90 shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)]'
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-none group-hover:bg-primary/10 transition-colors">
                                            <MessageSquare className="w-4 h-4 text-primary/70" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-medium truncate group-hover:text-primary/90 transition-colors">{chat.question}</span>
                                                <Globe className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary/50 transition-colors shrink-0" />
                                            </div>
                                            <p className="text-xs text-muted-foreground/70 mt-0.5 group-hover:text-muted-foreground transition-colors">
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
                                                    'group flex items-start gap-3 px-3.5 py-3 rounded-xl',
                                                    'hover:bg-muted/80 active:bg-muted/90 transition-all duration-200',
                                                    'hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)]',
                                                    chat._id === currentChatId && 'bg-muted/90 shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)]'
                                                )}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-none group-hover:bg-primary/10 transition-colors">
                                                    <MessageSquare className="w-4 h-4 text-primary/70" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-sm font-medium truncate group-hover:text-primary/90 transition-colors">{chat.question}</span>
                                                        <Globe className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary/50 transition-colors shrink-0" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground/70 mt-0.5 group-hover:text-muted-foreground transition-colors">
                                                        {chat._createdDate && formatDistanceToNow(new Date(chat._createdDate))} ago
                                                    </p>
                                                </div>
                                            </TransitionLink>
                                        ))}
                                        <button
                                            onClick={() => setShowMorePublic(!showMorePublic)}
                                            className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full group rounded-lg hover:bg-muted/50"
                                        >
                                            <ChevronDown className={cn(
                                                "w-4 h-4 text-muted-foreground/70 group-hover:text-primary/70 transition-all duration-200",
                                                showMorePublic && "rotate-180"
                                            )} />
                                            <span className="group-hover:text-primary/90 transition-colors font-medium">
                                                {showMorePublic ? 'Show Less' : `Show ${remainingPublicChats.length} More`}
                                            </span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {!isLoading && privateChats.length === 0 && publicChats.length === 0 && (
                        <div className="px-3 py-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-muted/80 to-muted/40 flex items-center justify-center mx-auto mb-4 shadow-inner">
                                <MessageSquare className="w-8 h-8 text-muted-foreground/70" />
                            </div>
                            <p className="text-base font-medium text-muted-foreground/90">No chats yet</p>
                            <p className="text-sm text-muted-foreground mt-1">Start a new chat to see it here</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
} 