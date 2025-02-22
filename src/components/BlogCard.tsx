'use client';

import Link from 'next/link';
import { WixMediaImage } from './WixMediaImage';
import { ArrowUpRight, User, Clock, Tag } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface BlogPost {
    _id: string;
    title: string;
    coverImage: string;
    excerpt?: string;
    content?: string;
    slug?: string;
    author?: {
        _id: string;
        name: string;
        image?: string;
    };
    type?: 'article' | 'nugget';
    tags?: string[];
    readingTime?: string;
}

export function BlogCard({ blog, variant = 'default' }: { blog: BlogPost; variant?: 'default' | 'compact' }) {
    const href = `/blog/${blog.slug || blog._id}`;
    const isNugget = blog.type === 'nugget';

    return (
        <Link href={href}>
            <article className={cn(
                "group cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-xl",
                variant === 'default' ? "hover:-translate-y-1" : "hover:bg-slate-50"
            )}>
                {variant === 'default' && blog.coverImage && (
                    <div className="aspect-[16/9] overflow-hidden">
                        <WixMediaImage
                            media={blog.coverImage}
                            width={1200}
                            height={675}
                            alt={blog.title || 'Blog post image'}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            objectFit="cover"
                        />
                    </div>
                )}
                <div className={cn(
                    "p-6",
                    variant === 'compact' && "p-4"
                )}>
                    {/* Type badge and tags */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div className={cn(
                            "px-2 py-1 rounded-md text-xs font-medium",
                            isNugget
                                ? "bg-amber-100 text-amber-700"
                                : "bg-primary/10 text-primary"
                        )}>
                            {isNugget ? 'Nugget' : 'Article'}
                        </div>
                        {blog.tags?.slice(0, 2).map(tag => (
                            <div key={tag} className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs">
                                {tag}
                            </div>
                        ))}
                    </div>

                    {/* Title */}
                    <h3 className={cn(
                        "font-serif tracking-tight group-hover:text-primary transition-colors",
                        variant === 'default' ? "text-xl mb-3" : "text-lg mb-2"
                    )}>
                        {blog.title}
                    </h3>

                    {/* Excerpt - only for default variant */}
                    {variant === 'default' && (
                        <p className="mb-5 text-sm text-muted-foreground line-clamp-3 font-serif leading-relaxed">
                            {blog.excerpt || blog.content?.substring(0, 160)}
                        </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm font-medium text-primary">
                            {isNugget ? 'Read nugget' : 'Read article'}
                            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </div>
                        <div className="flex items-center gap-4">
                            {blog.readingTime && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                    <span>{blog.readingTime}</span>
                                </div>
                            )}
                            {blog.author && variant === 'default' && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                    {blog.author.image ? (
                                        <WixMediaImage
                                            media={blog.author.image}
                                            width={24}
                                            height={24}
                                            alt={blog.author.name}
                                            className="h-6 w-6 rounded-full mr-2"
                                            objectFit="cover"
                                        />
                                    ) : (
                                        <User className="h-4 w-4 mr-2" />
                                    )}
                                    <span>{blog.author.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
} 