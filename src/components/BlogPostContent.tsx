'use client';

import { WixMediaImage } from './WixMediaImage';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { RichTextSkeleton, CommentsSkeleton } from './Skeletons';

const RichContentViewer = dynamic(
    () => import('./RichContentViewer').catch(err => {
        console.error('Error loading RichContentViewer:', err);
        return () => <div>Error loading content viewer</div>;
    }),
    {
        ssr: false,
        loading: () => <RichTextSkeleton />
    }
);

const Comments = dynamic(
    () => import('./Comments').then(mod => mod.Comments),
    {
        ssr: false,
        loading: () => <CommentsSkeleton />
    }
);

interface BlogPost {
    _id: string;
    title: string;
    coverImage?: string;
    excerpt?: string;
    content?: string;
    richContent?: {
        nodes: any[];
        metadata?: any;
    };
    slug?: string;
}

const Sidebar = () => (
    <aside className="space-y-8 sticky top-8">
        {/* Newsletter Subscription */}
        <div className="bg-white/30 backdrop-blur-sm border border-gray-100/50 p-6 rounded-xl">
            <h3 className="font-serif text-xl mb-3 text-gray-900">Newsletter</h3>
            <p className="text-gray-600 mb-4 text-base">Get weekly insights directly in your inbox.</p>
            <form className="space-y-3">
                <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-3 py-2 text-base border border-gray-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/60 transition-all bg-white/50"
                />
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-base font-medium hover:bg-blue-700 transition-all">
                    Subscribe
                </button>
            </form>
        </div>

        {/* Latest YouTube Video */}
        <div className="bg-white/30 backdrop-blur-sm border border-gray-100/50 p-6 rounded-xl">
            <h3 className="font-serif text-xl mb-4 text-gray-900">Latest Video</h3>
            <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden mb-3">
                <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/latest"
                    title="Latest YouTube video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1.5 text-sm">
                Watch on YouTube
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </a>
        </div>
    </aside>
);

export function BlogPostContent({ blog }: { blog: BlogPost }) {
    return (
        <div className="min-h-screen pb-32">
            {/* Hero Section */}
            <div className="relative h-[70vh] min-h-[600px] mb-16">
                {blog.coverImage && (
                    <>
                        <div className="absolute inset-0">
                            <WixMediaImage
                                media={blog.coverImage}
                                width={2000}
                                height={1000}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                                objectFit="cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-white"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-20">
                            <div className="max-w-7xl mx-auto">
                                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-gray-900 max-w-4xl">
                                    {blog.title}
                                </h1>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2">
                        <article className="prose prose-xl max-w-none mb-24 [&>p]:text-xl [&>p]:leading-relaxed [&>p]:text-gray-700 [&>h2]:text-3xl [&>h2]:font-serif [&>h3]:text-2xl [&>h3]:font-serif">
                            <Suspense fallback={<RichTextSkeleton />}>
                                {blog.richContent ? (
                                    <RichContentViewer content={blog.richContent} />
                                ) : blog.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                                ) : (
                                    <p>No content available</p>
                                )}
                            </Suspense>
                        </article>

                        <div className="border-t border-gray-100 pt-16">
                            <Suspense fallback={<CommentsSkeleton />}>
                                <Comments
                                    contextId={blog.slug || ''}
                                    resourceId={blog._id}
                                    isAuthenticated={true}
                                />
                            </Suspense>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <Sidebar />
                    </div>
                </div>
            </div>
        </div>
    );
}