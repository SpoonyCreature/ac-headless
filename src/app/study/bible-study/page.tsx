'use client';

import { useState, useEffect } from 'react';
import { Bot, Loader2, Clock, Globe, BookOpen, Search, Sparkles, Filter, Star, Users, BarChart, ChevronRight, PlusCircle, Lightbulb, BookMarked, Lock, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { usePageTransition } from '@/src/hooks/usePageTransition';
import { formatDistanceToNow } from 'date-fns';
import { BIBLE_STRUCTURE } from '@/src/lib/bible';
import { BibleStudySidebar } from '@/src/components/BibleStudySidebar';

const TRANSLATIONS = [
    { id: 'web', name: 'World English Bible' },
    { id: 'kjv', name: 'King James Version' },
    { id: 'aov', name: 'Afrikaanse Ou Vertaling' },
] as const;

type Translation = typeof TRANSLATIONS[number]['id'];

// Helper function to safely format date
const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Recently';

    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Recently';
        }
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        return 'Recently';
    }
};

type TabType = 'create' | 'studies';

export default function BibleStudyPage() {
    const [query, setQuery] = useState('');
    const [translation, setTranslation] = useState<Translation>('web');
    const [isLoadingStudies, setIsLoadingStudies] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [publicStudies, setPublicStudies] = useState<any[]>([]);
    const [userStudies, setUserStudies] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreatingStudy, setIsCreatingStudy] = useState(false);
    const { isTransitioning, navigateWithTransition } = usePageTransition();
    const [activeTab, setActiveTab] = useState<TabType>('create');
    const [currentPage, setCurrentPage] = useState(1);
    const studiesPerPage = 6;
    const [userContext, setUserContext] = useState<any>(null);
    const [isLoadingContext, setIsLoadingContext] = useState(false);
    const [coverage, setCoverage] = useState(0);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    // Update the useEffect to fetch user studies and context
    useEffect(() => {
        const init = async () => {
            setIsLoadingStudies(true);
            setIsLoadingContext(true);
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                setIsAuthenticated(!!data.user);

                // Fetch public studies
                const publicStudiesResponse = await fetch('/api/bible-study?public=true&limit=3');
                const publicStudiesData = await publicStudiesResponse.json();
                setPublicStudies(publicStudiesData.studies || []);

                // If authenticated, fetch user's studies and context
                if (data.user) {
                    const [userStudiesResponse, userContextResponse] = await Promise.all([
                        fetch('/api/bible-study'),
                        fetch('/api/user-context')
                    ]);

                    const userStudiesData = await userStudiesResponse.json();
                    setUserStudies(userStudiesData.studies || []);

                    const contextData = await userContextResponse.json();
                    setUserContext(contextData.userContext);
                    setCoverage(contextData.coverage);
                }
            } catch (error) {
                console.error('Error during initialization:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoadingStudies(false);
                setIsLoadingContext(false);
            }
        };
        init();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            const response = await fetch('/api/bible-study/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    translation
                }),
            });

            if (!response.ok) throw new Error('Failed to search Bible verses');
            const data = await response.json();

            setIsCreatingStudy(true);
            const createResponse = await fetch('/api/bible-study', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    translation,
                    verses: data.verses,
                    crossReferences: data.crossReferences,
                    explanation: data.explanation,
                }),
            });

            if (!createResponse.ok) throw new Error('Failed to create Bible study');
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
        <div className="flex min-h-screen bg-repeat">
            {/* Sidebar */}
            <BibleStudySidebar
                privateStudies={userStudies}
                publicStudies={publicStudies}
                isLoading={isLoadingStudies}
                isAuthenticated={isAuthenticated}
                showSidebar={showSidebar}
                onCloseSidebar={() => setShowSidebar(false)}
            />

            <div className="flex-1">
                {/* Header */}
                <header className="bg-primary py-4 px-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="lg:hidden p-2 -m-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="font-serif text-2xl sm:text-3xl text-primary-foreground">Bible Study</h1>
                            <p className="text-primary-foreground/80 text-sm sm:text-base">Study Scripture with verse analysis and cross-references</p>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 sm:px-6 py-8">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {/* Bible Study Creation Card */}
                        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                            <div className="p-8">
                                <form onSubmit={handleSearch} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <label htmlFor="query" className="text-lg font-medium text-foreground flex items-center gap-2.5">
                                                <Search className="w-5 h-5 text-primary" />
                                                What would you like to study?
                                            </label>
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <input
                                                        id="query"
                                                        type="text"
                                                        value={query}
                                                        onChange={(e) => setQuery(e.target.value)}
                                                        placeholder="Enter a verse (John 3:16), topic (God's love), or question"
                                                        className="w-full h-14 sm:h-16 px-4 sm:px-6 pr-[90px] rounded-xl bg-white 
                                                            text-base placeholder:text-muted-foreground/50
                                                            border-2 border-border/20 hover:border-primary/30
                                                            focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
                                                            transition-all duration-200"
                                                        disabled={isSearching || isCreatingStudy}
                                                    />
                                                    <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2">
                                                        <div className="px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-muted-foreground/70">
                                                            Enter ↵
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <select
                                                        value={translation}
                                                        onChange={(e) => setTranslation(e.target.value as Translation)}
                                                        className="flex-1 h-12 px-4 rounded-lg bg-white text-base appearance-none 
                                                            focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
                                                            border-2 border-border/20 hover:border-primary/30 transition-all"
                                                        disabled={isSearching || isCreatingStudy}
                                                    >
                                                        {TRANSLATIONS.map((t) => (
                                                            <option key={t.id} value={t.id}>{t.name}</option>
                                                        ))}
                                                    </select>

                                                    <button
                                                        type="submit"
                                                        disabled={isSearching || isCreatingStudy || !query.trim()}
                                                        className={cn(
                                                            "h-12 px-6 rounded-lg font-medium flex items-center justify-center gap-2 text-base transition-all whitespace-nowrap",
                                                            isAuthenticated
                                                                ? "bg-primary text-white disabled:opacity-50 hover:bg-primary/90"
                                                                : "bg-primary text-white disabled:opacity-50 hover:bg-primary/90"
                                                        )}
                                                    >
                                                        {isSearching || isCreatingStudy ? (
                                                            <>
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                                {isSearching ? 'Searching...' : 'Creating Study...'}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Search className="w-5 h-5" />
                                                                Search
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Search Suggestions */}
                                                <div className="pt-6 border-t border-border/10">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Lightbulb className="w-4 h-4 text-primary/70" />
                                                        <h3 className="text-sm font-medium text-foreground/70">Try searching for:</h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {[
                                                            {
                                                                type: 'Verse',
                                                                examples: ['John 3:16', 'Psalm 23', 'Romans 8:28'],
                                                                icon: BookOpen
                                                            },
                                                            {
                                                                type: 'Topic',
                                                                examples: ["God's love", 'Faith', 'Prayer'],
                                                                icon: Filter
                                                            },
                                                            {
                                                                type: 'Question',
                                                                examples: ['What does the Bible say about hope?', 'How to deal with anxiety?'],
                                                                icon: Search
                                                            },
                                                            {
                                                                type: 'Character',
                                                                examples: ['Moses', 'David', 'Paul'],
                                                                icon: Users
                                                            }
                                                        ].map((category) => (
                                                            <div key={category.type} className="space-y-2">
                                                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                                    <category.icon className="w-3.5 h-3.5" />
                                                                    <span>{category.type}</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {category.examples.map((example) => (
                                                                        <button
                                                                            key={example}
                                                                            type="button"
                                                                            onClick={() => setQuery(example)}
                                                                            className="px-2.5 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 
                                                                                text-slate-700 rounded-md transition-colors"
                                                                        >
                                                                            {example}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Study Stats */}
                        {isAuthenticated && !isLoadingContext && (
                            <div className="grid sm:grid-cols-3 gap-4">
                                {[
                                    {
                                        title: "Bible Coverage",
                                        value: `${Math.round(coverage)}%`,
                                        description: "of the Bible studied",
                                        icon: BookOpen
                                    },
                                    {
                                        title: "Study Streak",
                                        value: userContext?.studyStreak || "0",
                                        description: "days in a row",
                                        icon: Sparkles
                                    },
                                    {
                                        title: "Total Studies",
                                        value: userStudies.length.toString(),
                                        description: "studies completed",
                                        icon: Star
                                    },
                                ].map((stat) => (
                                    <div key={stat.title} className="group relative p-6 rounded-xl border border-border/20 bg-white transition-all">
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="p-2 rounded-lg bg-slate-100">
                                                    <stat.icon className="w-4 h-4 text-foreground/70" />
                                                </div>
                                                <h3 className="text-sm font-medium text-foreground/70">{stat.title}</h3>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold">{stat.value}</span>
                                                <span className="text-sm text-foreground/60">{stat.description}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
} 
