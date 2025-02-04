'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Book, Search, Save, Menu, ChevronRight } from 'lucide-react';
import { BibleStudyResults } from '@/src/components/BibleStudyResults';
import { BibleStudySidebar } from '@/src/components/BibleStudySidebar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/src/lib/utils';

const TRANSLATIONS = [
    { id: 'web', name: 'World English Bible' },
    { id: 'kjv', name: 'King James Version' },
    { id: 'aov', name: 'Afrikaanse Ou Vertaling' },
] as const;

type Translation = typeof TRANSLATIONS[number]['id'];

export default function BibleStudyPage() {
    const [query, setQuery] = useState('');
    const [translation, setTranslation] = useState<Translation>('web');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [studies, setStudies] = useState<any[]>([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const router = useRouter();

    // Refs for each section
    const searchRef = useRef<HTMLDivElement>(null);
    const reviewRef = useRef<HTMLDivElement>(null);
    const saveRef = useRef<HTMLDivElement>(null);

    // Function to scroll to a section
    const scrollToSection = (step: number) => {
        setActiveStep(step);
        const ref = step === 1 ? searchRef : step === 2 ? reviewRef : saveRef;
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Check authentication status and fetch studies on mount
    useEffect(() => {
        const init = async () => {
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
            }
        };
        init();
    }, []); // Empty dependency array means this runs once on mount

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
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
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateStudy = async () => {
        if (!results) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/bible-study', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    translation,
                    verses: results.verses,
                    crossReferences: results.crossReferences,
                    explanation: results.explanation,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create Bible study');
            }

            const data = await response.json();
            router.push(`/ai/bible-study/${data.studyId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create Bible study');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[url('/paper-texture.png')] bg-repeat">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden fixed left-4 bottom-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out
                bg-background border-r border-border w-80
                ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <BibleStudySidebar
                    studies={studies}
                    currentUserId={currentUserId || undefined}
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
                {/* Progress Bar - Only show when there's a search */}
                {(query || results) && (
                    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
                        <div className="container mx-auto px-4">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-8">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                                !results ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
                                            )}>1</div>
                                            <span className={cn(
                                                "font-medium",
                                                !results ? "text-foreground" : "text-muted-foreground"
                                            )}>Search</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                                results && !isLoading ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
                                            )}>2</div>
                                            <span className={cn(
                                                "font-medium",
                                                results && !isLoading ? "text-foreground" : "text-muted-foreground"
                                            )}>Review</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                                false ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
                                            )}>3</div>
                                            <span className={cn(
                                                "font-medium",
                                                false ? "text-foreground" : "text-muted-foreground"
                                            )}>Save</span>
                                        </div>
                                    </div>
                                    {/* Reset button */}
                                    {results && (
                                        <button
                                            onClick={() => {
                                                setQuery('');
                                                setResults(null);
                                                setError(null);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Start New Study
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hero Section - Only show when there's no search */}
                {!query && !results && (
                    <div className="bg-gradient-to-b from-primary/5 to-transparent pt-24 pb-16">
                        <div className="container mx-auto px-4">
                            <div className="max-w-4xl mx-auto text-center">
                                <Book className="w-16 h-16 text-primary mx-auto mb-8" />
                                <h1 className="font-serif text-4xl md:text-6xl mb-6">Bible Study Assistant</h1>
                                <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                                    Create insightful Bible studies in minutes with AI-powered analysis and study tools
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Section */}
                <div className={cn(
                    "py-8",
                    query || results ? "border-b border-border" : ""
                )}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl mx-auto">
                            {/* Search Form */}
                            <div className={cn(
                                "bg-background rounded-2xl",
                                !query && !results ? "border border-border shadow-lg p-8" : ""
                            )}>
                                <form onSubmit={handleSearch}>
                                    <div className="flex gap-4 mb-4">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder="Enter a topic (e.g., 'love') or verse (e.g., 'John 3:16')"
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 pl-11"
                                            />
                                            <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading || !query.trim()}
                                            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
                                        >
                                            {isLoading ? 'Searching...' : 'Start Study'}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>Translation:</span>
                                        <select
                                            value={translation}
                                            onChange={(e) => setTranslation(e.target.value as Translation)}
                                            className="bg-transparent border-none focus:outline-none focus:ring-0 text-foreground"
                                        >
                                            {TRANSLATIONS.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </form>
                            </div>

                            {/* Next Step Hint - Only show when there's a query but no results */}
                            {query && !results && !isLoading && !error && (
                                <div className="mt-6 text-center text-muted-foreground">
                                    <p>Click "Start Study" to begin your Bible study journey</p>
                                </div>
                            )}

                            {/* Loading State */}
                            {isLoading && (
                                <div className="mt-8 text-center space-y-4">
                                    <Bot className="w-8 h-8 animate-spin mx-auto text-primary" />
                                    <div className="space-y-2">
                                        <p className="font-medium">Creating Your Bible Study</p>
                                        <p className="text-sm text-muted-foreground">Analyzing verses and generating insights...</p>
                                    </div>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Section - Only show on initial state */}
                {!query && !results && (
                    <div className="py-16 bg-background border-y border-border">
                        <div className="container mx-auto px-4">
                            <div className="max-w-5xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="relative">
                                        <div className="bg-gradient-to-b from-primary/5 to-transparent rounded-2xl p-6">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                                <Bot className="w-6 h-6 text-primary" />
                                            </div>
                                            <h3 className="font-medium text-lg mb-2">AI-Powered Insights</h3>
                                            <p className="text-muted-foreground">Get verse-by-verse commentary, cross-references, and theological insights generated by AI.</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="bg-gradient-to-b from-primary/5 to-transparent rounded-2xl p-6">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </div>
                                            <h3 className="font-medium text-lg mb-2">Personal Workspace</h3>
                                            <p className="text-muted-foreground">Add your own notes, create custom study guides, and organize your insights.</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="bg-gradient-to-b from-primary/5 to-transparent rounded-2xl p-6">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="font-medium text-lg mb-2">Study Journey</h3>
                                            <p className="text-muted-foreground">Track your progress, set study goals, and maintain consistent study habits.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {results && !isLoading && (
                    <div className="py-16">
                        <div className="container mx-auto px-4">
                            <div className="max-w-4xl mx-auto space-y-12">
                                {/* Results Header */}
                                <div className="text-center space-y-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                        <span>Step 2:</span> Review Your Study
                                    </div>
                                    <h2 className="text-2xl font-medium">Your Bible Study Results</h2>
                                    <p className="text-muted-foreground max-w-2xl mx-auto">
                                        Here's what we found for "{query}". Review the content below and when you're ready, save your study to access all features.
                                    </p>
                                </div>

                                {/* Results Content */}
                                <BibleStudyResults results={results} />

                                {/* Next Steps */}
                                <div className="bg-gradient-to-b from-primary/5 to-transparent rounded-2xl p-8 text-center space-y-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                        <span>Step 3:</span> Save Your Study
                                    </div>
                                    {isAuthenticated ? (
                                        <>
                                            <h3 className="text-xl font-medium">Ready to Enhance Your Study?</h3>
                                            <button
                                                onClick={handleCreateStudy}
                                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-lg"
                                            >
                                                <Save className="w-5 h-5" />
                                                Save Bible Study
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-medium">Sign In to Save Your Study</h3>
                                            <p className="text-muted-foreground max-w-xl mx-auto">
                                                Create an account to save your study, add personal notes, and access all premium features.
                                            </p>
                                            <a
                                                href="/login"
                                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-lg"
                                            >
                                                Get Started
                                                <ChevronRight className="w-4 h-4" />
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
} 
