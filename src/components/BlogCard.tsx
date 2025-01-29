'use client';

import Link from 'next/link';
import { WixMediaImage } from './WixMediaImage';
import { ArrowUpRight } from 'lucide-react';

interface BlogPost {
    _id: string;
    title: string;
    coverImage: string;
    excerpt?: string;
    content?: string;
    slug?: string;
}

export function BlogCard({ blog }: { blog: BlogPost }) {
    const href = `/blog/${blog.slug || blog._id}`;

    return (
        <Link href={href}>
            <article className="group cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1">
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
                <div className="p-8">
                    <h3 className="mb-4 text-2xl font-serif font-bold tracking-tight group-hover:text-primary transition-colors">
                        {blog.title}
                    </h3>
                    <p className="mb-6 text-base text-muted-foreground line-clamp-3 font-serif leading-relaxed">
                        {blog.excerpt || blog.content?.substring(0, 160)}
                    </p>
                    <div className="flex items-center text-base font-medium text-primary">
                        Read article
                        <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                </div>
            </article>
        </Link>
    );
} 