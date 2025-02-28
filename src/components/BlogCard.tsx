'use client';

import Link from 'next/link';
import { WixMediaImage } from './WixMediaImage';
import { ArrowUpRight, User, Clock, Tag, BookOpen } from 'lucide-react';
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
    publishedDate?: string;
}

export function BlogCard({ blog, variant = 'default' }: { blog: BlogPost; variant?: 'default' | 'compact' }) {
    const href = `/blog/${blog.slug || blog._id}`;
    const isNugget = blog.type === 'nugget';

    const formatDate = (date?: string) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (variant === 'compact') {
        return (
            <Link href={href}>
                <article className="group relative overflow-hidden bg-white hover:bg-slate-50 transition-all duration-300 rounded-xl border border-slate-200">
                    <div className="flex items-start gap-6 p-6">
                        <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-lg bg-slate-100">
                            <BookOpen className="w-7 h-7 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2.5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                                    Quick Read
                                </span>
                                {blog.readingTime && (
                                    <span className="text-sm text-slate-500">
                                        {blog.readingTime}
                                    </span>
                                )}
                            </div>
                            <h3 className="font-serif text-xl font-medium text-slate-900 mb-2 group-hover:text-primary transition-colors">
                                {blog.title}
                            </h3>
                            {blog.excerpt && (
                                <p className="text-slate-600 line-clamp-2 mb-4">
                                    {blog.excerpt}
                                </p>
                            )}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                {blog.publishedDate && (
                                    <time className="text-sm text-slate-500">
                                        {formatDate(blog.publishedDate)}
                                    </time>
                                )}
                                <div className="flex items-center text-primary font-medium text-sm">
                                    Read now
                                    <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </Link>
        );
    }

    return (
        <Link href={href}>
            <article className="group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 hover:bg-slate-50 transition-colors h-full">
                {blog.coverImage && (
                    <div className="aspect-[16/9] overflow-hidden">
                        <WixMediaImage
                            media={blog.coverImage}
                            width={600}
                            height={400}
                            alt={blog.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            objectFit="cover"
                        />
                    </div>
                )}
                <div className="flex flex-col flex-grow p-4 sm:p-5">
                    <div className="flex-grow">
                        {!isNugget && blog.tags?.[0] && (
                            <div className="mb-3">
                                <span className="inline-block px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                                    {blog.tags[0]}
                                </span>
                            </div>
                        )}
                        <h3 className="font-serif text-lg sm:text-xl font-medium text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {blog.title}
                        </h3>
                        {blog.excerpt && (
                            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                {blog.excerpt}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                            {blog.author && (
                                <div className="flex items-center gap-2 text-slate-700">
                                    <User className="h-4 w-4" />
                                    <span>{blog.author.name}</span>
                                </div>
                            )}
                            {blog.publishedDate && (
                                <time className="text-slate-600">{formatDate(blog.publishedDate)}</time>
                            )}

                        </div>
                        <div className="flex items-center text-primary font-medium">
                            {isNugget ? 'Read nugget' : 'Read article'}
                            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
} 