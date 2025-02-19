'use client';

import { useState, useEffect } from 'react';
import { Bot, History, Loader2, Clock, Globe, BookOpen } from 'lucide-react';
import { BibleStudySidebar } from '@/src/components/BibleStudySidebar';
import { useRouter } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { usePageTransition } from '@/src/hooks/usePageTransition';
import { formatDistanceToNow } from 'date-fns';

const TRANSLATIONS = [
    { id: 'web', name: 'World English Bible' },
    { id: 'kjv', name: 'King James Version' },
    { id: 'aov', name: 'Afrikaanse Ou Vertaling' },
] as const;

type Translation = typeof TRANSLATIONS[number]['id'];

// Add example queries to rotate through
const EXAMPLE_QUERIES = [
    "What does the Bible say about love?",
    "John 3",
    "The book of Genesis",
    "The story of David",
    "Wisdom from Proverbs",
];

export default function BibleStudyPage() {
    const [query, setQuery] = useState('');
    const [translation, setTranslation] = useState<Translation>('web');
    const [isLoadingStudies, setIsLoadingStudies] = useState(true);
    const [isLoadingPublicStudies, setIsLoadingPublicStudies] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [userStudies, setUserStudies] = useState<any[]>([]);
    const [publicStudies, setPublicStudies] = useState<any[]>([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreatingStudy, setIsCreatingStudy] = useState(false);
    const { isTransitioning, navigateWithTransition } = usePageTransition();
    const router = useRouter();

    // Check authentication status and fetch studies on mount
    useEffect(() => {
        const init = async () => {
            setIsLoadingStudies(true);
            setIsLoadingPublicStudies(true);
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                setIsAuthenticated(!!data.user);
                setCurrentUserId(data.user?._id || null);

                // Fetch public studies
                const publicStudiesResponse = await fetch('/api/bible-study?public=true&limit=3');
                const publicStudiesData = await publicStudiesResponse.json();
                setPublicStudies(publicStudiesData.studies || []);
                setIsLoadingPublicStudies(false);

                // If authenticated, fetch user's studies
                if (data.user) {
                    const userStudiesResponse = await fetch('/api/bible-study');
                    const userStudiesData = await userStudiesResponse.json();
                    setUserStudies(userStudiesData.studies || []);
                }
            } catch (error) {
                console.error('Error during initialization:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoadingStudies(false);
            }
        };
        init();
    }, []);

    // Add example query rotation effect
    useEffect(() => {
        if (!query) {
            const interval = setInterval(() => {
                setCurrentExampleIndex((prev) => (prev + 1) % EXAMPLE_QUERIES.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [query]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setError(null);

        try {
            const response = await fetch('/api/bible-study/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, translation }),
            });

            if (!response.ok) {
                throw new Error('Failed to search Bible verses');
            }

            const data = await response.json();

            setIsCreatingStudy(true);
            const createResponse = await fetch('/api/bible-study', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    translation,
                    verses: data.verses,
                    crossReferences: data.crossReferences,
                    explanation: data.explanation,
                }),
            });

            if (!createResponse.ok) {
                throw new Error('Failed to create Bible study');
            }

            const createData = await createResponse.json();
            await navigateWithTransition(`/study/bible-study/${createData.studyId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSearching(false);
            setIsCreatingStudy(false);
        }
    };

    return (
        <div className="flex justify-center">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden fixed right-4 bottom-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            >
                <History className="w-6 h-6" />
            </button>

            {/* Sidebar */}
            <div className={cn(
                'fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out',
                'bg-background border-r border-border w-80',
                showSidebar ? 'translate-x-0' : '-translate-x-full'
            )}>
                <BibleStudySidebar
                    studies={userStudies}
                    currentUserId={currentUserId || undefined}
                    isLoading={isLoadingStudies}
                />
            </div>

            {/* Overlay for mobile */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 min-h-screen mx-auto">
                <div className="container mx-auto px-4 py-8 md:py-16">
                    <div className="max-w-2xl mx-auto space-y-8">
                        {/* Hero Section */}
                        <div className="text-center">
                            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                                Bible Study Assistant
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Enter any topic, verse, or question to begin
                            </p>
                        </div>

                        {/* Search Section */}
                        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="flex flex-col gap-4">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Example: What does the Bible say about love? or John 3:16"
                                        className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        disabled={isSearching || isCreatingStudy}
                                    />

                                    <div className="flex gap-2">
                                        <select
                                            value={translation}
                                            onChange={(e) => setTranslation(e.target.value as Translation)}
                                            className="h-12 px-3 rounded-lg border border-border bg-background text-sm"
                                            disabled={isSearching || isCreatingStudy}
                                        >
                                            {TRANSLATIONS.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            type="submit"
                                            disabled={isSearching || isCreatingStudy || !query.trim()}
                                            className="flex-1 h-12 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                                        >
                                            {isSearching || isCreatingStudy ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Bot className="w-5 h-5" />
                                            )}
                                            <span>Start Study</span>
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="text-red-500 text-sm mt-2">
                                        {error}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Recent Public Studies */}
                        {!isLoadingPublicStudies && publicStudies.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
                                    <Globe className="w-5 h-5" />
                                    <h2>Recent Public Studies</h2>
                                </div>
                                <div className="grid gap-4">
                                    {publicStudies.map((study) => (
                                        <button
                                            key={study._id}
                                            onClick={() => navigateWithTransition(`/study/bible-study/${study._id}`)}
                                            className="w-full p-4 rounded-lg bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all text-left group"
                                        >
                                            <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                                                {study.query}
                                            </h3>
                                            {study.explanation && (
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {study.explanation}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                <time>{study._createdDate ? formatDistanceToNow(new Date(study._createdDate)) : 'Recently'} ago</time>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    <span>{study.verses?.length || 0} verses</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
} 
