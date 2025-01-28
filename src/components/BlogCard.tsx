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
            <article className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="aspect-[16/9] overflow-hidden">
                    <WixMediaImage
                        media={blog.coverImage}
                        width={800}
                        height={450}
                        alt={blog.title || 'Blog post image'}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        objectFit="cover"
                    />
                </div>
                <div className="p-6">
                    <h3 className="mb-3 text-xl font-semibold tracking-tight">
                        {blog.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                        {blog.excerpt || blog.content?.substring(0, 120)}
                    </p>
                    <div className="flex items-center text-sm font-medium">
                        Read article
                        <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                </div>
            </article>
        </Link>
    );
} 