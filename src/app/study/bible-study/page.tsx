'use client';

import { useState, useEffect } from 'react';
import { Bot, Loader2, Clock, Globe, BookOpen, Search, Sparkles, Filter, Star, Users, BarChart, ChevronRight, PlusCircle, Lightbulb, BookMarked, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { usePageTransition } from '@/src/hooks/usePageTransition';
import { formatDistanceToNow } from 'date-fns';
import { BIBLE_STRUCTURE } from '@/src/lib/bible';

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
        <div className="min-h-screen bg-repeat">
            {/* Simple functional header */}
            <section className="bg-[#0A1A3B] py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-[720px] mx-auto">
                        <h1 className="font-serif text-2xl sm:text-3xl text-white mb-3">Bible Study</h1>
                        <p className="text-white/90 text-lg">
                            Study Scripture with verse analysis, cross-references, and commentary
                        </p>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 sm:px-6 -mt-8 relative z-10">
                {/* Tabs with better mobile treatment */}
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white shadow-xl rounded-2xl p-1.5 mb-8">
                        <nav className="flex items-center justify-between border-b border-border/30">
                            {[
                                { id: 'create', label: 'Create Study', icon: PlusCircle },
                                { id: 'studies', label: 'My Studies', icon: BookMarked }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => isAuthenticated ? setActiveTab(tab.id as TabType) : setShowAuthModal(true)}
                                    className={cn(
                                        "flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 relative",
                                        activeTab === tab.id
                                            ? "text-primary border-b-2 border-primary -mb-[2px]"
                                            : "text-muted-foreground/70 hover:text-foreground"
                                    )}
                                >
                                    <tab.icon className={cn(
                                        "w-4 h-4",
                                        activeTab === tab.id ? "text-primary" : "text-muted-foreground/70"
                                    )} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="max-w-3xl mx-auto">
                        {activeTab === 'create' && (
                            <div className="space-y-6">
                                {/* Bible Study Creation Card */}
                                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                                    {/* Primary Input Section */}
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
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                        <span>{isSearching ? 'Searching...' : 'Creating...'}</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {isAuthenticated ? (
                                                                            <>Generate Study</>
                                                                        ) : (
                                                                            <>Sign in to Generate</>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {error && (
                                                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                                        {error}
                                                    </div>
                                                )}
                                            </div>
                                        </form>
                                    </div>

                                    {/* Quick Ideas - More compact and integrated */}
                                    <div className="border-t border-border/30 bg-slate-50">
                                        <div className="p-8">
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <Lightbulb className="w-4 h-4 text-primary" />
                                                </div>
                                                <h3 className="text-base font-medium text-foreground">Quick Ideas</h3>
                                            </div>
                                            <div className="space-y-6">
                                                <div>
                                                    <div className="text-sm text-muted-foreground mb-3">Popular verses and topics</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            "John 3:16",
                                                            "Psalm 23",
                                                            "God's love",
                                                            "Faith",
                                                            "Grace",
                                                            "Hope",
                                                        ].map((idea) => (
                                                            <button
                                                                key={idea}
                                                                onClick={() => setQuery(idea)}
                                                                className="px-3 py-1.5 rounded-lg bg-white border border-border/20 text-sm hover:border-primary/30 hover:bg-white/80 transition-colors"
                                                            >
                                                                {idea}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="text-sm text-muted-foreground mb-3">Example studies</div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {[
                                                            {
                                                                text: "What does Philippians 4:6-7 teach about anxiety and peace?",
                                                                description: "Verse study",
                                                                icon: BookOpen
                                                            },
                                                            {
                                                                text: "Compare Jesus's parables about the Kingdom of Heaven",
                                                                description: "Theme study",
                                                                icon: Filter
                                                            }
                                                        ].map((prompt) => (
                                                            <button
                                                                key={prompt.text}
                                                                onClick={() => setQuery(prompt.text)}
                                                                className="flex items-center gap-3 p-3 rounded-lg border border-border/20 hover:border-primary/30 bg-white text-left group transition-all"
                                                            >
                                                                <div className="shrink-0 p-1.5 rounded-md bg-primary/10">
                                                                    <prompt.icon className="w-4 h-4 text-primary" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium truncate">{prompt.text}</p>
                                                                    <p className="text-xs text-muted-foreground">{prompt.description}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'studies' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/20">
                                    <h2 className="text-lg font-medium text-foreground/90">My Bible Studies</h2>
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 transition-colors text-sm"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        New Study
                                    </button>
                                </div>

                                {isLoadingStudies ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-5 h-5 animate-spin text-foreground/50" />
                                    </div>
                                ) : userStudies.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 mb-3">
                                            <BookOpen className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <h3 className="text-base font-medium text-foreground/90 mb-1">No studies yet</h3>
                                        <p className="text-sm text-foreground/60">
                                            Start your first Bible study by selecting "Create Study" above
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="divide-y divide-border/10">
                                            {userStudies.slice((currentPage - 1) * studiesPerPage, currentPage * studiesPerPage).map((study) => (
                                                <button
                                                    key={study._id}
                                                    onClick={() => navigateWithTransition(`/study/bible-study/${study._id}`)}
                                                    className="w-full group px-4 py-3 -mx-4 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="shrink-0 p-2 mt-0.5 rounded bg-slate-100 transition-colors">
                                                        <BookOpen className="w-4 h-4 text-foreground/70" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <h3 className="text-base text-foreground/90 group-hover:text-foreground truncate mb-1">
                                                            {study.query}
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-xs text-foreground/50">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                <span>{formatDate(study.createdAt)}</span>
                                                            </div>
                                                            {study.verses?.length > 0 && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <BookOpen className="w-3.5 h-3.5" />
                                                                    <span>{study.verses.length} verses</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-foreground/50 transition-colors" />
                                                </button>
                                            ))}
                                        </div>

                                        {userStudies.length > studiesPerPage && (
                                            <div className="flex justify-center gap-1 pt-4 border-t border-border/10">
                                                {Array.from({ length: Math.ceil(userStudies.length / studiesPerPage) }).map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentPage(i + 1)}
                                                        className={cn(
                                                            "w-8 h-8 rounded flex items-center justify-center text-sm transition-colors",
                                                            currentPage === i + 1
                                                                ? "bg-slate-900 text-white"
                                                                : "text-foreground/60 hover:text-foreground hover:bg-slate-100"
                                                        )}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                                <Lock className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="text-xl font-medium mb-2">Sign in to Continue</h2>
                            <p className="text-muted-foreground text-sm">
                                Create an account to generate personalized Bible studies and track your progress.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    setShowAuthModal(false);
                                    // TODO: Implement sign in logic
                                }}
                                className="w-full h-11 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                            >
                                Sign in
                            </button>
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="w-full h-11 rounded-lg bg-zinc-100 text-zinc-900 font-medium hover:bg-zinc-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 
