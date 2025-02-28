'use client';

import { useState } from 'react';
import { getWixClient } from '../app/wixClient';
import { BlogCard } from './BlogCard';
import { BookOpen, LayoutGrid, Rows } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SearchLibrary } from './SearchLibrary';

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

const NUGGET_TAG = 'ea7588d3-9337-44c3-b989-0243d12c8441';

interface BlogPostsProps {
    initialPosts: BlogPost[];
}

export function BlogPosts({ initialPosts }: BlogPostsProps) {
    const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
    const [activeFilter, setActiveFilter] = useState<'articles' | 'nuggets'>('articles');
    const [layout, setLayout] = useState<'grid' | 'rows'>('grid');

    const handleSearch = (searchResults: BlogPost[]) => {
        // Ensure search results have the correct type property
        console.log("TESTING");
        console.log(searchResults);
        const processedResults = searchResults.map(post => ({
            ...post,
            type: post.tags?.includes(NUGGET_TAG) ? 'nugget' : 'article'
        })) as BlogPost[];
        setPosts(processedResults);
    };

    const filteredPosts = posts.filter(post => {
        if (!post) return false;

        const postType = post.tags?.includes(NUGGET_TAG) ? 'nugget' : 'article';
        return (activeFilter === 'articles' && postType === 'article') ||
            (activeFilter === 'nuggets' && postType === 'nugget');
    });

    return (
        <div className="space-y-8">
            <SearchLibrary onSearch={handleSearch} />
            {/* Filters */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="flex flex-col gap-6 py-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
                                {[
                                    { id: 'articles', label: 'Articles', count: posts.filter(p => p.type === 'article').length },
                                    { id: 'nuggets', label: 'Quick Reads', count: posts.filter(p => p.type === 'nugget').length, icon: BookOpen }
                                ].map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
                                        className={cn(
                                            "relative flex-1 sm:flex-initial px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                                            activeFilter === filter.id
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-600 hover:text-slate-900"
                                        )}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {filter.icon && <filter.icon className="w-4 h-4" />}
                                            <span>{filter.label}</span>
                                            <span className="text-xs text-slate-500">({filter.count})</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {activeFilter === 'articles' && (
                                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                                    <button
                                        onClick={() => setLayout('grid')}
                                        className={cn(
                                            "p-2.5 rounded-md transition-all",
                                            layout === 'grid'
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-600 hover:text-slate-900"
                                        )}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setLayout('rows')}
                                        className={cn(
                                            "p-2.5 rounded-md transition-all",
                                            layout === 'rows'
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-600 hover:text-slate-900"
                                        )}
                                    >
                                        <Rows className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            {activeFilter === 'articles' ? (
                <div className={cn(
                    "grid gap-6",
                    layout === 'grid'
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1"
                )}>
                    {filteredPosts.map((post) => (
                        <div
                            key={post._id}
                            className={cn(
                                layout === 'rows' && "md:col-span-full"
                            )}
                        >
                            <BlogCard
                                blog={post}
                                variant="default"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredPosts.map((post) => (
                        <div key={post._id}>
                            <BlogCard
                                blog={post}
                                variant="compact"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No posts found</h3>
                    <p className="text-slate-600">Try adjusting your search or filter to find what you&apos;re looking for.</p>
                </div>
            )}
        </div>
    );
} 
