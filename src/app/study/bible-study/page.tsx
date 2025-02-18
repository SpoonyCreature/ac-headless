'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, BookMarked, Search, History, BookOpen, MessageSquare, Globe, Loader2 } from 'lucide-react';
import { BibleStudySidebar } from '@/src/components/BibleStudySidebar';
import { useRouter } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { usePageTransition } from '@/src/hooks/usePageTransition';

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
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [studies, setStudies] = useState<any[]>([]);
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
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                setIsAuthenticated(!!data.user);
                setCurrentUserId(data.user?._id || null);

                if (data.user) {
                    const studiesResponse = await fetch('/api/bible-study');
                    const studiesData = await studiesResponse.json();
                    setStudies(studiesData.studies || []);
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

            // Automatically create the Bible study
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
                    studies={studies}
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
                    <div className="max-w-4xl mx-auto">
                        {/* Hero Section - Simplified and more focused */}
                        <div className="text-center mb-8">
                            <div className="relative inline-block mb-6">
                                <BookMarked className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                            </div>
                            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                                Unlock the Bible
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Search any topic or verse to start your guided Bible study journey
                            </p>
                        </div>

                        {/* Quick Start Cards - Visual guides for common actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <button
                                onClick={() => setQuery("What does the Bible say about love?")}
                                className="p-6 text-left rounded-xl border border-border bg-background hover:border-primary/50 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Search className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                    <h3 className="font-medium">Explore Topics</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Search for themes like "love", "faith", or "wisdom"
                                </p>
                            </button>

                            <button
                                onClick={() => setQuery("John 3:16")}
                                className="p-6 text-left rounded-xl border border-border bg-background hover:border-primary/50 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <BookOpen className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                    <h3 className="font-medium">Study Verses</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Enter specific verses like "John 3:16" or "Psalm 23"
                                </p>
                            </button>
                        </div>

                        {/* Enhanced Search Section */}
                        <div className="bg-background rounded-xl border border-border shadow-sm p-6 md:p-8 mb-8">
                            <form onSubmit={handleSearch} className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                                    <div className="relative flex-1">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <Search className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder={EXAMPLE_QUERIES[currentExampleIndex]}
                                            className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 pl-10"
                                            disabled={isSearching || isCreatingStudy}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSearching || isCreatingStudy || !query.trim()}
                                        className="h-12 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap flex items-center justify-center gap-2"
                                    >
                                        {isSearching ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Searching...</span>
                                            </>
                                        ) : isCreatingStudy ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Creating Study...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Bot className="w-5 h-5" />
                                                <span>Start Study</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <span>Translation:</span>
                                        <select
                                            value={translation}
                                            onChange={(e) => setTranslation(e.target.value as Translation)}
                                            className="bg-transparent focus:outline-none focus:ring-0 text-foreground"
                                            disabled={isSearching || isCreatingStudy}
                                        >
                                            {TRANSLATIONS.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {error && (
                                        <p className="text-destructive text-sm">{error}</p>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Recent Studies Section - Only show if user has studies */}
                        {studies.length > 0 && (
                            <div className="rounded-xl border border-border p-6">
                                <h2 className="text-xl font-medium mb-4">Recent Studies</h2>
                                <div className="space-y-3">
                                    {studies.slice(0, 3).map((study: any) => (
                                        <button
                                            key={study._id}
                                            onClick={() => navigateWithTransition(`/study/bible-study/${study._id}`)}
                                            className="w-full p-4 rounded-lg border border-border hover:border-primary/50 transition-all text-left group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium group-hover:text-primary transition-colors">{study.query}</h3>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(study.createdAt).toLocaleDateString()}
                                                </span>
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
