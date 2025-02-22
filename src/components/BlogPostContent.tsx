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
    publishedDate?: string;
    lastPublishedDate?: string;
    timeToRead?: number;
    viewCount?: number;
}

interface Book {
    title: string;
    image: string;
    link: string;
    displayPrice?: string;
}

interface ErrorDetails {
    applicationError?: {
        code: string;
        description: string;
    };
}

const Sidebar = ({ books }: { books: Book[] }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const data = await response.json();
                setErrorMessage(data.error);
                setErrorDetails(data.details);
                throw new Error(data.error);
            }

            setSubscribeStatus('success');
            setEmail('');
        } catch (error: any) {
            console.error('Subscription error:', error);
            setSubscribeStatus('error');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => {
                setSubscribeStatus('idle');
                setErrorMessage('');
                setErrorDetails(null);
            }, 3000);
        }
    };

    return (
        <aside className="space-y-8">
            {/* Newsletter */}
            <div className="bg-primary/5 backdrop-blur-sm rounded-xl border border-primary/10 p-6">
                <h3 className="font-serif text-xl text-foreground mb-3">Stay Updated</h3>
                <p className="text-muted-foreground text-sm mb-4">Get the latest Reformed theological insights delivered to your inbox.</p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                    <input
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-lg 
                                 placeholder:text-muted-foreground/70 text-foreground
                                 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                                 hover:border-primary/30 transition-colors"
                        required
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg 
                                 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                            'Subscribe'
                        )}
                    </button>
                </form>
                {subscribeStatus === 'success' && (
                    <p className="mt-3 text-sm text-emerald-600 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        You&apos;re in! You will be included in newsletter.
                    </p>
                )}
                {subscribeStatus === 'error' && (
                    <p className="mt-3 text-sm text-red-600 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {['DUPLICATE_CONTACT_EXISTS', 'CONTACT_ID_ALREADY_EXISTS'].includes(errorDetails?.applicationError?.code || '')
                            ? "You're already subscribed!"
                            : "Oops! Please try again later..."}
                    </p>
                )}
            </div>

            {/* Recommended Books */}
            {books.length > 0 && (
                <div className="bg-primary/5 backdrop-blur-sm rounded-xl border border-primary/10 overflow-hidden">
                    <div className="p-6">
                        <div className="mb-6">
                            <h3 className="font-serif text-xl text-foreground mb-2">Recommended Reading</h3>
                            <p className="text-sm text-muted-foreground">Carefully selected books to deepen your understanding</p>
                        </div>
                        <div className="space-y-4">
                            {books.slice(0, 3).map((book, index) => (
                                <a
                                    key={index}
                                    href={book.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 transition-colors"
                                >
                                    <div className="w-16 h-20 relative rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                        <WixMediaImage
                                            media={book.image}
                                            width={64}
                                            height={80}
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            objectFit="cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                                            {book.title}
                                        </h4>
                                        {book.displayPrice && (
                                            <div className="text-sm text-muted-foreground group-hover:text-primary/70 transition-colors">
                                                {book.displayPrice}
                                            </div>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-primary/10">
                            <p className="text-sm text-muted-foreground text-center">Your purchase helps support our ministry</p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

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

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header Section */}
            <div className="relative">
                {blog.coverImage ? (
                    <>
                        {/* Full-width background image */}
                        <div className="h-[40vh] sm:h-[50vh] overflow-hidden">
                            <WixMediaImage
                                media={blog.coverImage}
                                width={1920}
                                height={1080}
                                className="w-full h-full object-cover"
                                objectFit="cover"
                            />
                        </div>

                        {/* Content section */}
                        <div className="max-w-6xl mx-auto px-6 -mt-16 sm:-mt-32 relative z-10">
                            <div className="max-w-4xl">
                                {/* Category */}
                                <div className="mb-4">
                                    <span className="inline-block bg-white px-3 py-1 text-sm tracking-widest font-medium text-gray-600 uppercase rounded-full shadow-sm">
                                        Articles
                                    </span>
                                </div>

                                {/* Title and Meta Container */}
                                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
                                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
                                        {blog.title}
                                    </h1>

                                    <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-gray-600 text-sm">
                                        {/* Author */}
                                        {blog.author && (
                                            <div className="flex items-center gap-2">
                                                {blog.author.profilePhoto && (
                                                    <div className="relative flex-shrink-0">
                                                        <Image
                                                            src={blog.author.profilePhoto}
                                                            alt={blog.author.nickname}
                                                            width={24}
                                                            height={24}
                                                            className="rounded-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <span>written by <span className="font-medium text-gray-900">{blog.author.nickname}</span></span>
                                            </div>
                                        )}

                                        {/* Date */}
                                        {blog.publishedDate && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <time className="font-medium text-gray-900">
                                                    {formatDate(blog.publishedDate)}
                                                </time>
                                            </>
                                        )}

                                        {/* Reading Time */}
                                        {blog.timeToRead && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {blog.timeToRead} min read
                                                </span>
                                            </>
                                        )}

                                        {/* Views */}
                                        {blog.viewCount !== undefined && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    {blog.viewCount} views
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // Fallback header - Also update the no-cover-image version
                    <div className="max-w-6xl mx-auto px-4 pt-16 sm:pt-24 pb-8 sm:pb-16 bg-gray-50">
                        <div className="max-w-4xl space-y-6">
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
                                    {blog.publishedDate && (
                                        <time className="font-medium">
                                            {formatDate(blog.publishedDate)}
                                        </time>
                                    )}
                                    {blog.timeToRead && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                            <span>{blog.timeToRead} min read</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
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