import { Chat } from '@/src/types/chat';
import { MessageSquare, Plus, Lock, Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
    const initialPublicChats = publicChats.slice(0, 10);
    const remainingPublicChats = publicChats.slice(10);

    return (
        <div className="w-80 border-r border-border bg-muted/10 flex flex-col h-full">
            <div className="p-4 flex-shrink-0">
                <Link
                    href="/ai/chat"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">New Chat</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-6">
                {privateChats.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">Your Chats</h3>
                        <div className="space-y-1">
                            {initialPrivateChats.map((chat) => (
                                <Link
                                    key={chat._id}
                                    href={`/ai/chat/${chat._id}`}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${chat._id === currentChatId ? 'bg-muted' : ''
                                        }`}
                                >
                                    <MessageSquare className="w-4 h-4 shrink-0" />
                                    <span className="text-sm truncate flex-1">{chat.question}</span>
                                    <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                                </Link>
                            ))}
                            {remainingPrivateChats.length > 0 && (
                                <>
                                    {showMorePrivate && remainingPrivateChats.map((chat) => (
                                        <Link
                                            key={chat._id}
                                            href={`/ai/chat/${chat._id}`}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${chat._id === currentChatId ? 'bg-muted' : ''
                                                }`}
                                        >
                                            <MessageSquare className="w-4 h-4 shrink-0" />
                                            <span className="text-sm truncate flex-1">{chat.question}</span>
                                            <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
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
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${chat._id === currentChatId ? 'bg-muted' : ''
                                        }`}
                                >
                                    <MessageSquare className="w-4 h-4 shrink-0" />
                                    <span className="text-sm truncate flex-1">{chat.question}</span>
                                    <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                                </Link>
                            ))}
                            {remainingPublicChats.length > 0 && (
                                <>
                                    {showMorePublic && remainingPublicChats.map((chat) => (
                                        <Link
                                            key={chat._id}
                                            href={`/ai/chat/${chat._id}`}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${chat._id === currentChatId ? 'bg-muted' : ''
                                                }`}
                                        >
                                            <MessageSquare className="w-4 h-4 shrink-0" />
                                            <span className="text-sm truncate flex-1">{chat.question}</span>
                                            <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
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
            </div>
        </div>
    );
} 