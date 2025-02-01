'use client';

import { WixMediaImage } from './WixMediaImage';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { RichTextSkeleton, CommentsSkeleton } from './Skeletons';
import { WIX_SESSION_COOKIE_NAME } from '../constants/constants';
import Image from 'next/image';

const RichContentViewer = dynamic(
    () => import('./RichContentViewer').catch(err => {
        console.error('Error loading RichContentViewer:', err);
        const FallbackComponent = () => <div>Error loading content viewer</div>;
        FallbackComponent.displayName = 'RichContentViewerFallback';
        return FallbackComponent;
    }),
    {
        ssr: false,
        loading: () => {
            const LoadingComponent = () => <RichTextSkeleton />;
            LoadingComponent.displayName = 'RichContentViewerLoading';
            return <LoadingComponent />;
        }
    }
);

RichContentViewer.displayName = 'RichContentViewer';

const Comments = dynamic(
    () => import('./Comments').then(mod => mod.Comments),
    {
        ssr: false,
        loading: () => {
            const LoadingComponent = () => <CommentsSkeleton />;
            LoadingComponent.displayName = 'CommentsLoading';
            return <LoadingComponent />;
        }
    }
);

Comments.displayName = 'DynamicComments';

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
        _id: string;
        profilePhoto?: string;
        title?: string;
        nickname: string;
        aboutPlain?: string | null;
        aboutRich?: any;
        slug?: string;
        coverPhoto?: string | null;
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
ShareButton.displayName = 'ShareButton';

const AuthorCard = ({ author }: { author: BlogPost['author'] }) => {
    if (!author) return null;

    return (
        <div className="flex items-start gap-6 p-6 rounded-xl bg-white/50">
            {author.profilePhoto && (
                <Image
                    src={author.profilePhoto}
                    alt={author.nickname}
                    width={56}
                    height={56}
                    className="rounded-full object-cover border border-gray-100 shadow-sm"
                />
            )}
            <div>
                <h3 className="font-serif text-lg text-gray-900 mb-1">{author.nickname}</h3>
                {author.title && (
                    <div className="text-gray-600 text-sm mb-2">{author.title}</div>
                )}
                {author.aboutPlain && (
                    <p className="text-gray-600 text-base leading-relaxed">{author.aboutPlain}</p>
                )}
            </div>
        </div>
    );
};
AuthorCard.displayName = 'AuthorCard';

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
Sidebar.displayName = 'Sidebar';

export function BlogPostContent({ blog }: { blog: BlogPost }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const cookies = document.cookie.split(';');
            const hasWixSession = cookies.some(cookie => cookie.trim().startsWith(WIX_SESSION_COOKIE_NAME + '='));
            setIsAuthenticated(hasWixSession);
        };
        checkAuth();
    }, []);

    return (
        <div className="min-h-screen pb-24">
            {/* Content and Sidebar */}
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main content */}
                    <article className="flex-grow">
                        {/* Title Section */}
                        <header className="mb-12">
                            {/* Meta Information */}
                            <div className="flex items-center gap-6 text-gray-600 text-sm tracking-wide mb-6">
                                {blog.publishedAt && (
                                    <time className="flex items-center gap-2 font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </time>
                                )}
                                {blog.readingTime && (
                                    <span className="flex items-center gap-2 font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {blog.readingTime} min read
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-8 leading-[1.1] tracking-tight">
                                {blog.title}
                            </h1>

                            {/* Author Section */}
                            {blog.author && (
                                <div className="flex items-center gap-4">
                                    {blog.author.profilePhoto && (
                                        <Image
                                            src={blog.author.profilePhoto}
                                            alt={blog.author.nickname}
                                            width={48}
                                            height={48}
                                            className="rounded-full object-cover border border-gray-200/50 shadow-sm"
                                        />
                                    )}
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {blog.author.nickname}
                                        </div>
                                        {blog.author.title && (
                                            <div className="text-sm text-gray-600 mb-2">
                                                {blog.author.title}
                                            </div>
                                        )}
                                        {blog.author.aboutPlain && (
                                            <p className="text-sm text-gray-600 line-clamp-1">
                                                {blog.author.aboutPlain}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </header>

                        <div className="prose max-w-none">
                            {blog.richContent ? (
                                <Suspense fallback={<RichTextSkeleton />}>
                                    <RichContentViewer content={blog.richContent} />
                                </Suspense>
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: blog.content || '' }} />
                            )}
                        </div>

                        <Suspense fallback={<CommentsSkeleton />}>
                            <Comments contextId={blog._id} resourceId={blog._id} isAuthenticated={isAuthenticated} />
                        </Suspense>
                    </article>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 shrink-0 lg:pt-[13.5rem]">
                        <Sidebar />
                    </aside>
                </div>
            </div>
        </div>
    );
}