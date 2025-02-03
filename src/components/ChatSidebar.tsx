import { Chat } from '@/src/types/chat';
import { MessageSquare, Plus, Lock, Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
    privateChats: Chat[];
    publicChats: Chat[];
    currentChatId?: string;
    currentUserId?: string;
}

export function ChatSidebar({ privateChats = [], publicChats = [], currentChatId, currentUserId }: ChatSidebarProps) {
    const [showMorePrivate, setShowMorePrivate] = useState(false);
    const [showMorePublic, setShowMorePublic] = useState(false);

    const initialPrivateChats = privateChats.slice(0, 5);
    const remainingPrivateChats = privateChats.slice(5);
    const initialPublicChats = publicChats.slice(0, 5);
    const remainingPublicChats = publicChats.slice(5);

    return (
        <div className="w-80 border-r border-border bg-background flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {privateChats.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">Your Chats</h3>
                        <div className="space-y-1">
                            {initialPrivateChats.map((chat) => (
                                <Link
                                    key={chat._id}
                                    href={`/ai/chat/${chat._id}`}
                                    className={`flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${chat._id === currentChatId ? 'bg-muted' : ''}`}
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
                                </Link>
                            ))}
                            {remainingPrivateChats.length > 0 && (
                                <>
                                    {showMorePrivate && remainingPrivateChats.map((chat) => (
                                        <Link
                                            key={chat._id}
                                            href={`/ai/chat/${chat._id}`}
                                            className={`flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${chat._id === currentChatId ? 'bg-muted' : ''}`}
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
                                        </Link>
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
                                <Link
                                    key={chat._id}
                                    href={`/ai/chat/${chat._id}`}
                                    className={`flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${chat._id === currentChatId ? 'bg-muted' : ''}`}
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
                                </Link>
                            ))}
                            {remainingPublicChats.length > 0 && (
                                <>
                                    {showMorePublic && remainingPublicChats.map((chat) => (
                                        <Link
                                            key={chat._id}
                                            href={`/ai/chat/${chat._id}`}
                                            className={`flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${chat._id === currentChatId ? 'bg-muted' : ''}`}
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
                                        </Link>
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

                {privateChats.length === 0 && publicChats.length === 0 && (
                    <div className="px-3 py-8 text-center text-muted-foreground">
                        <p>No chats yet</p>
                        <p className="text-sm mt-1">Start a new chat to see it here</p>
                    </div>
                )}
            </div>
        </div>
    );
} 