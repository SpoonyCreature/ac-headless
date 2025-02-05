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

const BookRecommendations = ({ books }: { books: Book[] }) => {
    const handleBookClick = useCallback((title: string) => {
        // You might want to add analytics here
        console.log('Book clicked:', title);
    }, []);

    if (!books || books.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 p-6 rounded-xl mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-xl text-gray-900">Deepen Your Knowledge</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">Recommended</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
                Hand-picked resources to master this topic
            </p>
            <div className="space-y-5">
                {books.map((book, index) => (
                    <div
                        key={index}
                        className="group relative bg-white p-4 rounded-lg border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-blue-100"
                    >
                        <a
                            href={book.link}
                            onClick={() => handleBookClick(book.title)}
                            className="block"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="flex flex-col">
                                {/* Book Cover */}
                                <div className="mx-auto w-32 h-44 relative mb-4 overflow-hidden rounded-lg shadow-sm transition-transform group-hover:scale-105 bg-gradient-to-b from-gray-50 to-white">
                                    <WixMediaImage
                                        media={book.image}
                                        width={128}
                                        height={176}
                                        className="object-cover"
                                        objectFit="cover"
                                    />
                                </div>

                                {/* Book Details */}
                                <div className="text-center">
                                    {index === 0 && (
                                        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full mb-2">
                                            Most Popular
                                        </span>
                                    )}
                                    <h4 className="text-gray-900 font-medium group-hover:text-gray-700 transition-colors mb-2">
                                        {book.title}
                                    </h4>
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        {book.displayPrice && (
                                            <span className="text-sm font-semibold text-gray-900">
                                                {book.displayPrice}
                                            </span>
                                        )}
                                        <span className="flex items-center text-xs text-amber-600 font-medium">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                            </svg>
                                            Limited Time Offer
                                        </span>
                                    </div>
                                    <button className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center group-hover:bg-gray-800">
                                        Get This Book
                                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Curated to complement this article
                </p>
            </div>
        </div>
    );
};

const Sidebar = ({ books }: { books: Book[] }) => (
    <aside className="space-y-6">
        <BookRecommendations books={books} />
        {/* Newsletter Subscription */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-6">
                <h3 className="font-serif text-xl mb-3 text-gray-900 font-bold">Subscribe to My Newsletter</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    Get exclusive insights and updates delivered straight to your inbox.
                </p>
                <form className="space-y-3">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-2.5 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all bg-gray-50"
                    />
                    <button className="w-full bg-gray-900 text-white px-6 py-2.5 rounded-lg text-base font-medium hover:bg-gray-800 transition-all">
                        Subscribe
                    </button>
                </form>
            </div>
        </div>

        {/* Latest YouTube Video */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-6">
                <h3 className="font-serif text-xl mb-4 text-gray-900 font-bold">Latest Video</h3>
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
        </div>
    </aside>
);
Sidebar.displayName = 'Sidebar';

export function BlogPostContent({ blog, books = [] }: { blog: BlogPost; books: Book[] }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const response = await fetch('/api/auth/me');
            const data = await response.json();
            setIsAuthenticated(!!data.user);
        };
        checkAuth();
    }, []);

    return (
        <div className="min-h-screen pb-24 bg-gray-50">
            {/* Hero Section with Cover Image */}
            {blog.coverImage && (
                <div className="relative bg-gray-900">
                    <WixMediaImage
                        media={blog.coverImage}
                        width={1920}
                        height={1080}
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                        objectFit="cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />
                    <div className="relative pt-24 pb-24 px-6 sm:px-8 lg:px-12 xl:px-24 text-white">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="flex flex-wrap justify-center items-center gap-3 mb-6 text-sm text-gray-300">
                                {blog.publishedAt && (
                                    <time className="flex items-center gap-2 font-medium ">
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 0118 0 9 9 0 0118 0z" />
                                        </svg>
                                        {blog.readingTime} min read
                                    </span>
                                )}
                            </div>
                            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                {blog.title}
                            </h1>
                            {blog.author && (
                                <div className="flex items-center justify-center gap-4 text-gray-300">
                                    {blog.author.profilePhoto && (
                                        <div className="shrink-0">
                                            <Image
                                                src={blog.author.profilePhoto}
                                                alt={blog.author.nickname}
                                                width={48}
                                                height={48}
                                                className="rounded-full object-cover ring-2 ring-gray-600"
                                            />
                                        </div>
                                    )}
                                    <div className="text-left">
                                        <span className="block text-sm font-medium">By {blog.author.nickname}</span>
                                        {blog.author.title && (
                                            <span className="text-sm">{blog.author.title}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content and Sidebar */}
            <div className="container max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-24 mt-12 lg:mt-16">
                <div className="flex flex-col lg:flex-row items-start gap-12">
                    {/* Main content */}
                    <article className="flex-grow">
                        {/* Blog Content */}
                        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:tracking-tight prose-headings:font-bold prose-p:text-lg prose-p:leading-relaxed prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md">
                            {blog.richContent ? (
                                <Suspense fallback={<RichTextSkeleton />}>
                                    <RichContentViewer content={blog.richContent} />
                                </Suspense>
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: blog.content || '' }} />
                            )}
                        </div>

                        {/* Author Bio */}
                        {blog.author && blog.author.aboutPlain && (
                            <div className="mt-16 mb-16 p-8 rounded-2xl bg-white shadow-sm border border-gray-100">
                                <div className="flex items-start gap-6">
                                    {blog.author.profilePhoto && (
                                        <Image
                                            src={blog.author.profilePhoto}
                                            alt={blog.author.nickname}
                                            width={80}
                                            height={80}
                                            className="rounded-full object-cover ring-2 ring-gray-200"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-serif text-xl font-bold mb-2">{blog.author.nickname}</h3>
                                        {blog.author.title && (
                                            <div className="text-sm text-gray-600 mb-3">{blog.author.title}</div>
                                        )}
                                        <p className="text-base text-gray-700 leading-relaxed">{blog.author.aboutPlain}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add a divider and spacing before comments */}
                        <div className="my-16 border-t border-gray-200"></div>

                        <Suspense fallback={<CommentsSkeleton />}>
                            <Comments contextId={blog._id} resourceId={blog._id} isAuthenticated={isAuthenticated} />
                        </Suspense>
                    </article>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-[380px] shrink-0">
                        <div className="lg:sticky top-24 space-y-6">
                            <Sidebar books={books} />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}