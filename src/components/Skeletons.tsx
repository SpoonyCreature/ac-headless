'use client';

import React from 'react';

// Base skeleton components
export function CardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[16/9] rounded-xl bg-muted mb-4" />
            <div className="space-y-3">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
            </div>
        </div>
    );
}

export function CompactCardSkeleton() {
    return (
        <div className="animate-pulse rounded-xl border border-border/20 bg-muted/5 p-6">
            <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                </div>
            </div>
        </div>
    );
}

// Page-specific skeleton layouts
export function BlogListSkeleton() {
    return (
        <div className="space-y-16">
            {/* Regular Posts */}
            <div>
                <h2 className="font-serif text-3xl  mb-8">Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {[...Array(6)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>

            {/* Nuggets */}
            <div>
                <h2 className="font-serif text-3xl  mb-8">Nuggets</h2>
                <div className="grid grid-cols-1 gap-4 mb-8">
                    {[...Array(3)].map((_, i) => (
                        <CompactCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function BlogPostSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="animate-pulse space-y-4">
                <div className="h-12 bg-muted rounded w-3/4" />
                <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                </div>
            </div>

            {/* Image */}
            <div className="animate-pulse">
                <div className="aspect-[16/9] rounded-xl bg-muted" />
            </div>

            {/* Content */}
            <div className="animate-pulse space-y-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-[95%]" />
                        <div className="h-4 bg-muted rounded w-[90%]" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export const RichTextSkeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
);

export const CommentsSkeleton = () => (
    <div className="animate-pulse space-y-4 mt-8">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
        </div>
    </div>
);

export function ChatSkeleton() {
    return (
        <div className="flex min-h-screen bg-gradient-to-b from-background to-background/95">
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-primary py-4 px-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden p-2 -m-2 rounded-full bg-primary-foreground/10 animate-pulse">
                            <div className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="h-8 bg-primary-foreground/10 rounded w-48 animate-pulse" />
                            <div className="h-5 bg-primary-foreground/10 rounded w-64 mt-1 animate-pulse" />
                        </div>
                    </div>
                </header>

                {/* Messages Container */}
                <div className="flex-1 pb-40">
                    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-muted-foreground/10 animate-pulse flex-shrink-0" />
                                <div className="flex-1 space-y-2 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 bg-muted-foreground/10 rounded w-24 animate-pulse" />
                                        <div className="h-4 bg-muted-foreground/10 rounded w-16 animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-muted-foreground/10 rounded w-full animate-pulse" />
                                        <div className="h-4 bg-muted-foreground/10 rounded w-[95%] animate-pulse" />
                                        <div className="h-4 bg-muted-foreground/10 rounded w-[85%] animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div className="fixed bottom-0 left-0 right-0 lg:left-80 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="max-w-3xl mx-auto p-4">
                        <div className="relative">
                            <div className="h-[52px] bg-muted-foreground/10 rounded-xl animate-pulse" />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-9 h-9 rounded-lg bg-muted-foreground/10 animate-pulse" />
                            </div>
                        </div>
                        <div className="mt-2 text-center">
                            <div className="h-4 bg-muted-foreground/10 rounded w-48 mx-auto animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="w-80 border-r border-border/50 bg-background/95 backdrop-blur-sm flex flex-col h-full shadow-[8px_0_32px_-12px_rgba(0,0,0,0.12)] dark:shadow-[8px_0_32px_-12px_rgba(0,0,0,0.3)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* First Section */}
                <div>
                    <div className="text-sm font-medium text-muted-foreground/80 mb-3 px-3 flex items-center gap-2">
                        <div className="p-1 rounded-md bg-muted/50">
                            <div className="w-3.5 h-3.5 bg-muted-foreground/10 rounded animate-pulse" />
                        </div>
                        <div className="h-4 bg-muted-foreground/10 rounded w-24 animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="px-3.5 py-3 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-none">
                                        <div className="w-4 h-4 bg-muted-foreground/10 rounded animate-pulse" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted-foreground/10 rounded w-3/4 animate-pulse" />
                                        <div className="h-3 bg-muted-foreground/10 rounded w-1/4 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Second Section */}
                <div>
                    <div className="text-sm font-medium text-muted-foreground/80 mb-3 px-3 flex items-center gap-2">
                        <div className="p-1 rounded-md bg-muted/50">
                            <div className="w-3.5 h-3.5 bg-muted-foreground/10 rounded animate-pulse" />
                        </div>
                        <div className="h-4 bg-muted-foreground/10 rounded w-28 animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="px-3.5 py-3 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-none">
                                        <div className="w-4 h-4 bg-muted-foreground/10 rounded animate-pulse" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted-foreground/10 rounded w-3/4 animate-pulse" />
                                        <div className="h-3 bg-muted-foreground/10 rounded w-1/4 animate-pulse" />
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

export function BibleStudyDetailSkeleton() {
    return (
        <div className="flex min-h-screen bg-gradient-to-b from-background to-background/95">
            <div className="flex-1">
                {/* Header */}
                <div className="p-4 border-t border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-card text-card-foreground rounded-2xl border shadow-sm">
                            <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2 -ml-2 rounded-full bg-muted/5 animate-pulse">
                                            <div className="w-5 h-5 bg-muted-foreground/10 rounded" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="h-5 bg-muted-foreground/10 rounded w-48 animate-pulse" />
                                            <div className="h-4 bg-muted-foreground/10 rounded w-32 mt-1 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-9 w-9 rounded-lg bg-muted-foreground/10 animate-pulse" />
                                        <div className="h-9 w-24 rounded-lg bg-muted-foreground/10 animate-pulse hidden sm:block" />
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 sm:px-6 py-2 border-t flex items-center gap-2 justify-between">
                                <div className="h-8 w-24 rounded-lg bg-muted-foreground/10 animate-pulse" />
                                <div className="h-8 w-32 rounded-lg bg-muted-foreground/10 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="space-y-4">
                        <div className="h-4 bg-muted-foreground/10 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-muted-foreground/10 rounded w-1/2 animate-pulse" />
                        <div className="h-4 bg-muted-foreground/10 rounded w-5/6 animate-pulse" />
                        <div className="h-4 bg-muted-foreground/10 rounded w-2/3 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}