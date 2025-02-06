'use client';

import { WixMediaImage } from './WixMediaImage';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState, useCallback } from 'react';
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

interface Book {
    title: string;
    image: string;
    link: string;
    displayPrice?: string;
}


const Sidebar = ({ books }: { books: Book[] }) => (
    <aside className="space-y-8">
        {/* Recommended Books */}
        {books.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-6">
                    <div className="mb-4">
                        <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Recommended Reading</h3>
                        <p className="text-sm text-gray-600">Support our ministry by exploring these carefully selected books</p>
                    </div>
                    <div className="space-y-6">
                        {books.slice(0, 3).map((book, index) => (
                            <div key={index} className="group relative bg-gray-50 p-4 rounded-lg">
                                <div className="flex gap-4">
                                    <div className="w-20 h-28 relative rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                                        <WixMediaImage
                                            media={book.image}
                                            width={80}
                                            height={112}
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            objectFit="cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 mb-1 truncate">
                                            {book.title}
                                        </h4>
                                        {book.displayPrice && (
                                            <div className="text-sm text-gray-600 mb-3">
                                                Support us: {book.displayPrice}
                                            </div>
                                        )}
                                        <a
                                            href={book.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            Purchase & Support
                                            <svg className="w-4 h-4 ml-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-4 text-center">Your purchase helps us create more content and resources</p>
                    </div>
                </div>
            </div>
        )}

        {/* Newsletter */}
        <div className="bg-gray-900 rounded-lg p-6 text-white">
            <h3 className="font-serif text-lg font-semibold mb-3">Stay Updated</h3>
            <p className="text-gray-300 text-sm mb-4">Get the latest insights delivered to your inbox.</p>
            <form className="space-y-3">
                <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-4 py-2 text-sm bg-white/10 border border-white/20 rounded-lg placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Subscribe
                </button>
            </form>
        </div>
    </aside>
);

export function BlogPostContent({ blog, books = [] }: { blog: BlogPost; books: Book[] }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me');
                setIsAuthenticated(response.ok);
            } catch (error) {
                console.error('Error checking authentication:', error);
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header Section */}
            <div className="relative">
                {blog.coverImage ? (
                    <>
                        {/* Full-width background image with overlay */}
                        <div className="absolute inset-0 h-[60vh] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-white z-10" />
                            <WixMediaImage
                                media={blog.coverImage}
                                width={1920}
                                height={1080}
                                className="w-full h-full object-cover"
                                objectFit="cover"
                            />
                        </div>

                        {/* Content overlay */}
                        <div className="relative z-20 px-4 min-h-[60vh] flex flex-col justify-center">
                            <div className="max-w-6xl mx-auto w-full">
                                <div className="max-w-4xl">
                                    {/* Category */}
                                    <div className="mb-6">
                                        <span className="text-sm tracking-widest font-medium text-white/90 uppercase">
                                            Articles
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                                        {blog.title}
                                    </h1>

                                    {/* Meta Container */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        {/* Author */}
                                        {blog.author && (
                                            <div className="flex items-center gap-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-xl">
                                                {blog.author.profilePhoto && (
                                                    <div className="relative">
                                                        <Image
                                                            src={blog.author.profilePhoto}
                                                            alt={blog.author.nickname}
                                                            width={32}
                                                            height={32}
                                                            className="rounded-full object-cover ring-2 ring-white/90"
                                                        />
                                                    </div>
                                                )}
                                                <div className="text-gray-800 text-sm pr-1">
                                                    written by <span className="font-semibold">{blog.author.nickname}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Date and Reading Time */}
                                        <div className="flex items-center gap-4 text-white/90 text-sm">
                                            {blog.publishedAt && (
                                                <time className="font-medium">
                                                    {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </time>
                                            )}
                                            {blog.readingTime && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-white/60"></span>
                                                    <span>{blog.readingTime} read</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // Fallback header for posts without cover image
                    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 bg-gray-50">
                        <div className="max-w-4xl">
                            {/* Category */}
                            <div className="mb-8">
                                <span className="text-sm tracking-widest font-medium text-gray-600 uppercase">
                                    Articles
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-[1.1] tracking-tight">
                                {blog.title}
                            </h1>

                            {/* Meta Container */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                {/* Author */}
                                {blog.author && (
                                    <div className="flex items-center gap-3 px-3 py-1.5 bg-white rounded-full shadow-sm">
                                        {blog.author.profilePhoto && (
                                            <div className="relative">
                                                <Image
                                                    src={blog.author.profilePhoto}
                                                    alt={blog.author.nickname}
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full object-cover ring-2 ring-white/90"
                                                />
                                            </div>
                                        )}
                                        <div className="text-gray-800 text-sm pr-1">
                                            written by <span className="font-semibold">{blog.author.nickname}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Date and Reading Time */}
                                <div className="flex items-center gap-4 text-gray-600 text-sm">
                                    {blog.publishedAt && (
                                        <time className="font-medium">
                                            {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </time>
                                    )}
                                    {blog.readingTime && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                            <span>{blog.readingTime} read</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-10 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <article className="lg:col-span-8">
                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none 
                            prose-headings:font-serif prose-headings:font-bold
                            prose-p:text-gray-600 prose-p:leading-relaxed
                            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-700
                            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-gray-50
                            prose-blockquote:py-2 prose-blockquote:px-4
                            prose-code:text-blue-600 prose-code:bg-gray-50
                            prose-pre:bg-gray-900 prose-pre:text-gray-100
                            prose-img:rounded-lg">
                            <Suspense fallback={<RichTextSkeleton />}>
                                {blog.richContent ? (
                                    <RichContentViewer content={blog.richContent} />
                                ) : (
                                    blog.content && <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                                )}
                            </Suspense>
                        </div>


                        {/* Comments Section */}
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <Suspense fallback={<CommentsSkeleton />}>
                                <Comments contextId={blog._id} resourceId={blog._id} isAuthenticated={isAuthenticated} />
                            </Suspense>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-8 lg:self-start">
                        <Sidebar books={books} />
                    </div>
                </div>
            </div>
        </div>
    );
}