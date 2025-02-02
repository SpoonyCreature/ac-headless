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

export function NuggetCard({ blog }: { blog: BlogPost }) {
    const href = `/blog/${blog.slug || blog._id}`;

    return (
        <Link href={href}>
            <article className="group cursor-pointer overflow-hidden rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="flex gap-4 p-6">
                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                        <WixMediaImage
                            media={blog.coverImage}
                            width={400}
                            height={400}
                            alt={blog.title || 'Nugget image'}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            objectFit="cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="mb-2 text-lg font-serif  tracking-tight group-hover:text-primary transition-colors">
                            {blog.title}
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-2 font-serif leading-relaxed">
                            {blog.excerpt || blog.content?.substring(0, 120)}
                        </p>
                        <div className="flex items-center text-sm font-medium text-primary">
                            Read nugget
                            <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
} 