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

// Add categories for better organization
const FEATURES = [
    { icon: BookOpen, label: 'Search Topics & Verses' },
    { icon: MessageSquare, label: 'In-Depth Analysis' },
    { icon: Globe, label: 'Save & Organize Studies' },
] as const;

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
        <div className={cn(
            "flex min-h-screen bg-[url('/paper-texture.png')] bg-repeat",
            "transition-opacity duration-300",
            isTransitioning ? "opacity-50" : "opacity-100"
        )}>
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
            <main className="flex-1 min-h-screen">
                <div className="container mx-auto px-4 py-8 md:py-16">
                    <div className="max-w-4xl mx-auto">
                        {/* Hero Section */}
                        <div className="text-center mb-12">
                            <div className="relative inline-block mb-6">
                                <BookMarked className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                            </div>
                            <h1 className="font-serif text-3xl md:text-6xl mb-4">Interactive Bible Study</h1>
                            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Explore Scripture deeply with AI-powered insights and cross-references
                            </p>
                        </div>

                        {/* Search Section */}
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
                                            placeholder="Enter a topic (e.g., 'faith') or verse (e.g., 'John 3:16')"
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
                                                <span>Creating Bible Study...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5" />
                                                <span>Generate Bible Study</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
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

                                <div className="flex flex-col items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">Try searching for topics or verses like:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-primary">{EXAMPLE_QUERIES[currentExampleIndex]}</span>
                                        <span className="text-muted-foreground text-xs">({currentExampleIndex + 1}/{EXAMPLE_QUERIES.length})</span>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Loading States */}
                        {(isSearching || isCreatingStudy) && (
                            <div className="text-center space-y-4 py-12">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                <p className="text-lg text-muted-foreground">
                                    {isSearching ? (
                                        "Searching for relevant Bible verses..."
                                    ) : (
                                        "Creating your Bible study..."
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="text-center py-8">
                                <p className="text-red-500">{error}</p>
                            </div>
                        )}

                        {/* Features Grid */}
                        {!isSearching && !isCreatingStudy && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                                {FEATURES.map((feature) => (
                                    <div key={feature.label} className="bg-gradient-to-b from-primary/5 to-transparent rounded-xl p-6">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                            <feature.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="font-medium text-lg mb-2">{feature.label}</h3>
                                        <p className="text-muted-foreground text-sm">
                                            {feature.label === 'Search Topics & Verses' && 'Search any Bible topic or verse reference for instant insights.'}
                                            {feature.label === 'In-Depth Analysis' && 'Get deep analysis and cross-references powered by AI.'}
                                            {feature.label === 'Save & Organize Studies' && 'Create and organize your personal Bible study library.'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
} 
