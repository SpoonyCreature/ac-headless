'use client';

import { WixMediaImage } from './WixMediaImage';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { RichTextSkeleton, CommentsSkeleton } from './Skeletons';
import { WIX_SESSION_COOKIE_NAME } from '../constants/constants';

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
    author?: {
        name: string;
        image?: string;
        bio?: string;
    };
    publishedAt?: string;
    readingTime?: string;
}

const ShareButton = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </button>
);

const AuthorCard = ({ author }: { author: BlogPost['author'] }) => {
    if (!author) return null;

    return (
        <div className="flex items-start gap-6 p-6 rounded-xl bg-white/50">
            {author.image && (
                <img
                    src={author.image}
                    alt={author.name}
                    className="w-14 h-14 rounded-full object-cover border border-gray-100 shadow-sm"
                />
            )}
            <div>
                <h3 className="font-serif text-lg text-gray-900 mb-1">{author.name}</h3>
                {author.bio && (
                    <p className="text-gray-600 text-base leading-relaxed">{author.bio}</p>
                )}
            </div>
        </div>
    );
};

const Sidebar = () => (
    <aside className="space-y-6 sticky top-8">
        {/* Newsletter Subscription */}
        <div className="bg-white/50 border border-gray-100 p-6 rounded-xl">
            <h3 className="font-serif text-xl mb-3 text-gray-900">Subscribe to My Newsletter</h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Get exclusive insights and updates delivered straight to your inbox.
            </p>
            <form className="space-y-3">
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all bg-white/80"
                />
                <button className="w-full bg-gray-900 text-white px-6 py-2.5 rounded-lg text-base font-medium hover:bg-gray-800 transition-all">
                    Subscribe
                </button>
            </form>
        </div>

        {/* Latest YouTube Video */}
        <div className="bg-white/50 border border-gray-100 p-6 rounded-xl">
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
            <a href="#" className="text-gray-900 hover:text-gray-600 font-medium inline-flex items-center gap-2 text-sm group">
                Watch on YouTube
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </a>
        </div>
    </aside>
);

export function BlogPostContent({ blog }: { blog: BlogPost }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                setIsAuthenticated(!!data.user);
            } catch (error) {
                console.error('Error checking auth status:', error);
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <div className="min-h-screen pb-24 bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <div className="relative h-[70vh] min-h-[500px] mb-12">
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
                        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-16">
                            <div className="max-w-6xl mx-auto">
                                <div className="max-w-4xl">
                                    {/* Title */}
                                    <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-gray-900 mb-6 leading-tight">
                                        {blog.title}
                                    </h1>

                                    {/* Meta Information */}
                                    <div className="flex items-center gap-6 text-gray-600 text-sm">
                                        {blog.publishedAt && (
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        )}
                                        {blog.readingTime && (
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {blog.readingTime} min read
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        {/* Author Card - Top */}
                        {blog.author && (
                            <div className="mb-8">
                                <AuthorCard author={blog.author} />
                            </div>
                        )}

                        {/* Social Share Buttons */}
                        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-8">
                            <ShareButton
                                icon={
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                    </svg>
                                }
                                label="Share on Twitter"
                            />
                            <ShareButton
                                icon={
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                }
                                label="Share on Facebook"
                            />
                            <ShareButton
                                icon={
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                }
                                label="Share on LinkedIn"
                            />
                        </div>

                        {/* Article Content */}
                        <article className="prose prose-xl max-w-none mb-16 
                            prose-headings:font-serif 
                            prose-p:text-xl prose-p:leading-relaxed prose-p:text-gray-700
                            prose-h1:text-4xl prose-h1:mb-6
                            prose-h2:text-3xl prose-h2:mb-4
                            prose-h3:text-2xl prose-h3:mb-4
                            prose-a:text-gray-900 prose-a:no-underline hover:prose-a:text-gray-600
                            prose-blockquote:border-l-4 prose-blockquote:border-gray-900/20 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-xl
                            prose-strong:text-gray-900
                            prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                            prose-pre:bg-gray-900 prose-pre:text-gray-100
                            prose-img:rounded-lg prose-img:shadow-sm
                            prose-video:rounded-lg prose-video:shadow-sm
                            prose-ul:text-xl prose-ul:text-gray-700
                            prose-ol:text-xl prose-ol:text-gray-700
                            prose-li:marker:text-gray-400
                            [&>*]:text-xl [&>*]:text-gray-700
                            [&>*:first-child]:mt-0">
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

                        {/* Author Card - Bottom */}
                        {blog.author && (
                            <div className="mb-16">
                                <AuthorCard author={blog.author} />
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="border-t border-gray-100 pt-12">
                            <Suspense fallback={<CommentsSkeleton />}>
                                <Comments
                                    contextId={blog._id}
                                    resourceId={blog._id}
                                    isAuthenticated={isAuthenticated}
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