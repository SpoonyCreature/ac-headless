'use client';

import { useState } from 'react';
import { getWixClient } from '../app/wixClient';
import { BlogCard } from './BlogCard';
import { NuggetCard } from './NuggetCard';
import { Button } from './Button';
import { Loader2 } from 'lucide-react';

interface BlogPost {
    _id: string;
    title: string;
    coverImage: string;
    excerpt?: string;
    content?: string;
    slug?: string;
    tags?: string[];
}

const ITEMS_TO_LOAD = 6;
const NUGGET_TAG = 'ea7588d3-9337-44c3-b989-0243d12c8441';

export function BlogPosts({ initialPosts }: { initialPosts: BlogPost[] }) {
    const [posts, setPosts] = useState<BlogPost[]>(() => {
        return initialPosts;
    });
    const [nuggets, setNuggets] = useState<BlogPost[]>(() => {
        return initialPosts.filter(post => post.tags?.includes(NUGGET_TAG)) || [];
    });
    const [regularPosts, setRegularPosts] = useState<BlogPost[]>(() => {
        return initialPosts.filter(post => !post.tags?.includes(NUGGET_TAG)) || [];
    });

    const [postsLoading, setPostsLoading] = useState(false);
    const [nuggetsLoading, setNuggetsLoading] = useState(false);
    const [postsOffset, setPostsOffset] = useState(regularPosts.length);
    const [nuggetsOffset, setNuggetsOffset] = useState(nuggets.length);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [hasMoreNuggets, setHasMoreNuggets] = useState(true);

    const loadMore = async (type: 'posts' | 'nuggets') => {
        const isNuggets = type === 'nuggets';
        const setLoading = isNuggets ? setNuggetsLoading : setPostsLoading;
        const setOffset = isNuggets ? setNuggetsOffset : setPostsOffset;
        const currentOffset = isNuggets ? nuggetsOffset : postsOffset;
        const setHasMore = isNuggets ? setHasMoreNuggets : setHasMorePosts;
        const setPosts = isNuggets ? setNuggets : setRegularPosts;

        try {
            setLoading(true);
            const wixClient = getWixClient();
            const response = await wixClient.items
                .query('Blog/Posts')
                .limit(ITEMS_TO_LOAD)
                .skip(currentOffset)
                .find();

            const items = response.items as BlogPost[];
            const filteredItems = isNuggets
                ? items.filter(item => item.tags?.includes(NUGGET_TAG))
                : items.filter(item => !item.tags?.includes(NUGGET_TAG));

            if (filteredItems.length > 0) {
                setPosts(prev => [...prev, ...filteredItems]);
                setOffset(currentOffset + filteredItems.length);
            }

            if (filteredItems.length < ITEMS_TO_LOAD) {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more posts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-24">
            {/* Regular Posts Section */}
            <div>
                <h2 className="font-serif text-3xl mb-12">Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-12">
                    {regularPosts.map((post) => (
                        <BlogCard key={post._id} blog={post} />
                    ))}
                </div>
                {hasMorePosts && (
                    <div className="flex justify-center mt-8">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => loadMore('posts')}
                            disabled={postsLoading}
                        >
                            {postsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Load More Articles
                        </Button>
                    </div>
                )}
            </div>

            {/* Nuggets Section */}
            <div>
                <h2 className="font-serif text-3xl mb-12">Nuggets</h2>
                <div className="grid grid-cols-1 gap-6 mb-12">
                    {nuggets.map((nugget) => (
                        <NuggetCard key={nugget._id} blog={nugget} />
                    ))}
                </div>
                {hasMoreNuggets && (
                    <div className="flex justify-center mt-8">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => loadMore('nuggets')}
                            disabled={nuggetsLoading}
                        >
                            {nuggetsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Load More Nuggets
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
} 
