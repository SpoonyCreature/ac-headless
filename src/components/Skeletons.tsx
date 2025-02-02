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