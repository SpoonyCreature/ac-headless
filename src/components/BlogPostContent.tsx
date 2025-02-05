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
    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-full transition-all duration-200">
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </button>
);

const AuthorCard = ({ author }: { author: BlogPost['author'] }) => {
    if (!author) return null;

    return (
        <div className="flex items-start gap-6 p-8 rounded-2xl bg-gradient-to-br from-white via-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            {author.profilePhoto && (
                <Image
                    src={author.profilePhoto}
                    alt={author.nickname}
                    width={72}
                    height={72}
                    className="rounded-2xl object-cover border-2 border-white shadow-md"
                />
            )}
            <div>
                <h3 className="font-serif text-xl text-gray-900 mb-2 font-semibold">{author.nickname}</h3>
                {author.title && (
                    <div className="text-gray-600 text-sm mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {author.title}
                    </div>
                )}
                {author.aboutPlain && (
                    <p className="text-gray-600 text-base leading-relaxed">{author.aboutPlain}</p>
                )}
            </div>
        </div>
    );
};

const BookRecommendations = ({ books }: { books: Book[] }) => {
    const handleBookClick = useCallback((title: string) => {
        console.log('Book clicked:', title);
    }, []);

    if (!books || books.length === 0) return null;

    return (
        <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl text-gray-900 font-semibold">Featured Books</h3>
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">New</span>
            </div>
            <p className="text-gray-600 text-sm mb-6">
                Curated resources to expand your knowledge
            </p>
            <div className="space-y-6">
                {books.map((book, index) => (
                    <div
                        key={index}
                        className="group relative bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-blue-100"
                    >
                        <a
                            href={book.link}
                            onClick={() => handleBookClick(book.title)}
                            className="block"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="flex items-center gap-6">
                                {/* Book Cover */}
                                <div className="w-24 h-36 relative overflow-hidden rounded-lg shadow-md transition-transform group-hover:scale-105 bg-gradient-to-b from-gray-50 to-white">
                                    <WixMediaImage
                                        media={book.image}
                                        width={96}
                                        height={144}
                                        className="object-cover"
                                        objectFit="cover"
                                    />
                                </div>

                                {/* Book Details */}
                                <div className="flex-1">
                                    {index === 0 && (
                                        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                                            Bestseller
                                        </span>
                                    )}
                                    <h4 className="text-gray-900 font-medium text-lg group-hover:text-gray-700 transition-colors mb-2">
                                        {book.title}
                                    </h4>
                                    <div className="flex items-center gap-3 mb-4">
                                        {book.displayPrice && (
                                            <span className="text-sm font-semibold text-gray-900">
                                                {book.displayPrice}
                                            </span>
                                        )}
                                        <span className="flex items-center text-xs text-amber-600 font-medium">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                            </svg>
                                            Special Offer
                                        </span>
                                    </div>
                                    <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group-hover:gap-3">
                                        View Details
                                        <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

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
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <article className="lg:col-span-8">
                        {/* Article Header */}
                        <header className="mb-12">
                            {blog.coverImage && (
                                <div className="aspect-[2/1] overflow-hidden rounded-lg mb-8">
                                    <WixMediaImage
                                        media={blog.coverImage}
                                        width={1200}
                                        height={600}
                                        className="w-full h-full object-cover"
                                        objectFit="cover"
                                    />
                                </div>
                            )}
                            <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                {blog.title}
                            </h1>
                            <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
                                {blog.author && (
                                    <div className="flex items-center gap-2">
                                        {blog.author.profilePhoto && (
                                            <Image
                                                src={blog.author.profilePhoto}
                                                alt={blog.author.nickname}
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        )}
                                        <span className="text-gray-900 font-medium">{blog.author.nickname}</span>
                                    </div>
                                )}
                                {blog.publishedAt && (
                                    <time>
                                        {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </time>
                                )}
                                {blog.readingTime && (
                                    <span>{blog.readingTime} read</span>
                                )}
                            </div>
                        </header>

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

                        {/* Author Bio */}
                        {blog.author?.aboutPlain && (
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <div className="flex items-start gap-4">
                                    {blog.author.profilePhoto && (
                                        <Image
                                            src={blog.author.profilePhoto}
                                            alt={blog.author.nickname}
                                            width={64}
                                            height={64}
                                            className="rounded-full"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">About {blog.author.nickname}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{blog.author.aboutPlain}</p>
                                    </div>
                                </div>
                            </div>
                        )}

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