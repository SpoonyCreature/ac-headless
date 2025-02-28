'use client';

import { useState } from 'react';
import { getWixClient } from '../app/wixClient';
import { BlogCard } from './BlogCard';
import { Search, BookOpen, LayoutGrid, Rows } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface BlogPost {
    _id: string;
    title: string;
    coverImage: string;
    excerpt?: string;
    content?: string;
    slug?: string;
    tags?: string[];
    type?: 'article' | 'nugget';
    readingTime?: string;
    publishedDate?: string;
}

const ITEMS_TO_LOAD = 6;
const NUGGET_TAG = 'ea7588d3-9337-44c3-b989-0243d12c8441';

export function BlogPosts({ initialPosts }: { initialPosts: BlogPost[] }) {
    const [posts] = useState<BlogPost[]>(() => {
        return initialPosts.map(post => ({
            ...post,
            type: post.tags?.includes(NUGGET_TAG) ? 'nugget' : 'article'
        }));
    });

    const [activeFilter, setActiveFilter] = useState<'articles' | 'nuggets'>('articles');
    const [searchQuery, setSearchQuery] = useState('');
    const [layout, setLayout] = useState<'grid' | 'rows'>('grid');

    const filteredPosts = posts.filter(post => {
        const matchesFilter =
            (activeFilter === 'articles' && post.type === 'article') ||
            (activeFilter === 'nuggets' && post.type === 'nugget');

        const matchesSearch =
            searchQuery === '' ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-8">
            {/* Filters and Search */}
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

                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-100 border-transparent focus:bg-white focus:border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
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
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                        <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No posts found</h3>
                    <p className="text-slate-600">Try adjusting your search or filter to find what you&apos;re looking for.</p>
                </div>
            )}
        </div>
    );
} 
