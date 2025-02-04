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
    { icon: Search, label: 'Search Topics & Verses' },
    { icon: Bot, label: 'AI-Powered Analysis' },
    { icon: Save, label: 'Save & Organize Studies' },
] as const;

export default function BibleStudyPage() {
    const [query, setQuery] = useState('');
    const [translation, setTranslation] = useState<Translation>('web');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingStudies, setIsLoadingStudies] = useState(true);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [studies, setStudies] = useState<any[]>([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
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
    }, []); // Empty dependency array means this runs once on mount

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
                className="lg:hidden fixed right-4 bottom-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            >
                <Menu className="w-6 h-6" />
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
                {/* Hero Section - Only show when there's no search */}
                {!query && !results && (
                    <div className="bg-gradient-to-b from-primary/5 to-transparent pt-8 md:pt-24 pb-8 md:pb-16">
                        <div className="container mx-auto px-4">
                            <div className="max-w-4xl mx-auto text-center">
                                <div className="relative inline-block mb-6 md:mb-8">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                                    <Book className="w-12 h-12 md:w-16 md:h-16 text-primary relative" />
                                </div>
                                <h1 className="font-serif text-3xl md:text-6xl mb-4 md:mb-6">AI-Powered Bible Study</h1>
                                <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
                                    Experience deeper biblical understanding with AI-guided analysis
                                </p>
                                <div className="flex flex-col items-center gap-4 md:gap-6">
                                    <div className="flex flex-col items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Try searching for topics or verses like:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-primary animate-pulse">{EXAMPLE_QUERIES[currentExampleIndex]}</span>
                                            <span className="text-muted-foreground text-xs">({currentExampleIndex + 1}/{EXAMPLE_QUERIES.length})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Section */}
                <div className={cn(
                    "py-4 md:py-8",
                    query || results ? "border-b border-border" : ""
                )}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl mx-auto">
                            {/* Search Form */}
                            <div className={cn(
                                "bg-background rounded-xl md:rounded-2xl transition-all duration-300",
                                !query && !results ? "border border-border shadow-lg p-4 md:p-8" : ""
                            )}>
                                <form onSubmit={handleSearch} className="space-y-4">
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
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading || !query.trim()}
                                            className="h-12 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <Bot className="w-5 h-5 animate-spin" />
                                                    Analyzing...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Bot className="w-5 h-5" />
                                                    Preview Study
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span>Translation:</span>
                                        <select
                                            value={translation}
                                            onChange={(e) => setTranslation(e.target.value as Translation)}
                                            className="bg-transparent focus:outline-none focus:ring-0 text-foreground"
                                        >
                                            {TRANSLATIONS.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        This will generate a study outline that you can further explore and customize
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section - Only show on initial state */}
                {!query && !results && (
                    <div className="py-8 md:py-16">
                        <div className="container mx-auto px-4">
                            <div className="max-w-5xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                                    {FEATURES.map((feature) => (
                                        <div key={feature.label} className="bg-gradient-to-b from-primary/5 to-transparent rounded-xl p-6">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                                <feature.icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <h3 className="font-medium text-lg mb-2">{feature.label}</h3>
                                            <p className="text-muted-foreground text-sm">
                                                {feature.label === 'Search Topics & Verses' && 'Search any Bible topic or verse reference for instant insights.'}
                                                {feature.label === 'AI-Powered Analysis' && 'Get deep analysis and cross-references powered by AI.'}
                                                {feature.label === 'Save & Organize Studies' && 'Create and organize your personal Bible study library.'}
                                            </p>
                                        </div>
                                    ))}
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
                                        <Bot className="w-4 h-4" />
                                        <span>Study Preview</span>
                                    </div>
                                    <h2 className="text-2xl font-medium">Your Study Overview</h2>
                                    <p className="text-muted-foreground max-w-2xl mx-auto">
                                        Here&apos;s an overview of your study on &quot;{query}&quot;. Save to unlock in-depth features including original language study, commentary insights, personal notes, and more.
                                    </p>
                                </div>

                                {/* Results Content */}
                                <BibleStudyResults results={results} />

                                {/* Next Steps */}
                                <div className="bg-gradient-to-b from-primary/5 to-transparent rounded-2xl p-8 text-center space-y-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                        <Save className="w-4 h-4" />
                                        <span>Save & Continue</span>
                                    </div>
                                    {isAuthenticated ? (
                                        <>
                                            <h3 className="text-xl font-medium">Ready to Build Your Full Study?</h3>
                                            <p className="text-muted-foreground max-w-xl mx-auto">
                                                Create your comprehensive study with original language insights, commentary references, personal notes, and sharing options.
                                            </p>
                                            <button
                                                onClick={handleCreateStudy}
                                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-lg group relative overflow-hidden"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    <Save className="w-5 h-5" />
                                                    Build Full Study
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/5 to-primary-foreground/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-medium">Build Your Complete Study</h3>
                                            <p className="text-muted-foreground max-w-xl mx-auto">
                                                Create a free account to build your comprehensive study with original language analysis, commentary insights, verse highlighting, personal notes, and easy sharing.
                                            </p>
                                            <Link
                                                href="/login"
                                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-lg group relative overflow-hidden"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    Get Started
                                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/5 to-primary-foreground/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                            </Link>
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
