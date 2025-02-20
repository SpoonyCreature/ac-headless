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

type TabType = 'create' | 'studies' | 'insights';

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
        <div className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat">
            {/* Hero Header */}
            <div className="relative">
                <div className="absolute inset-0 bg-[url('/bs.jpeg')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/50 backdrop-blur-[2px]" />
                    {/* Add animated particles effect */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute w-1/3 h-1/3 bg-primary/20 rounded-full blur-3xl animate-pulse top-1/4 left-1/4 mix-blend-overlay" />
                        <div className="absolute w-1/4 h-1/4 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-300 top-1/3 right-1/3 mix-blend-overlay" />
                        <div className="absolute w-1/3 h-1/3 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-500 bottom-1/4 right-1/4 mix-blend-overlay" />
                    </div>
                </div>
                <div className="relative container mx-auto px-4 sm:px-6 pt-24 pb-28 sm:pt-36 sm:pb-40">
                    <div className="max-w-[720px] mx-auto text-center">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 mb-8 text-sm shadow-xl transform hover:scale-105 transition-all"
                        >
                            <Bot className="w-4 h-4" />
                            <span className="relative">
                                <span className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 blur"></span>
                                <span className="relative">Cutting Edge AI & Biblical Scholarship</span>
                            </span>
                        </div>

                        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white mb-8 tracking-tight leading-[1.15] font-medium">
                            <span className="inline-block transform hover:scale-105 transition-transform duration-300">The World's Most</span>{' '}
                            <span className="relative inline-block">
                                <span className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-500/30 blur"></span>
                                <span className="relative">Advanced</span>
                            </span>{' '}
                            <span className="inline-block transform hover:scale-105 transition-transform duration-300">Bible Study Platform</span>
                        </h1>

                        <p className="text-white/90 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed font-light">
                            Experience Scripture like never before with instant AI-powered insights,
                            cross-references, and in-depth analysis for any verse, topic, or character.
                        </p>
                    </div>
                </div>

                {/* Enhanced decorative elements */}
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-primary/30 via-purple-500/20 to-transparent blur-[100px] -mb-40 opacity-50" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/30 blur-[100px] -mb-32" />
            </div>

            <main className="container mx-auto px-4 sm:px-6 -mt-8 relative z-10">
                {/* Tabs in white card that overlaps the hero */}
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-1.5 mb-8 border border-white/40">
                        <div className="border-b border-border/30">
                            <div className="flex -mb-px justify-center sm:justify-start">
                                {[
                                    { id: 'create', label: 'Create Study', icon: PlusCircle },
                                    { id: 'studies', label: 'My Studies', icon: BookMarked },
                                    { id: 'insights', label: 'Insights', icon: BarChart }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => isAuthenticated ? setActiveTab(tab.id as TabType) : setShowAuthModal(true)}
                                        className={cn(
                                            "px-5 sm:px-7 py-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 relative group",
                                            activeTab === tab.id
                                                ? "border-primary text-primary"
                                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                        )}
                                    >
                                        <tab.icon className={cn(
                                            "w-4 h-4 transition-transform group-hover:scale-110",
                                            activeTab === tab.id ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        <span>{tab.label}</span>
                                        {activeTab === tab.id && (
                                            <span className="absolute inset-x-0 -bottom-px h-px bg-primary blur-sm" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="max-w-3xl mx-auto">
                        {activeTab === 'create' && (
                            <div className="space-y-8">
                                {/* Bible Study Creation Card */}
                                <div className="bg-white/95 backdrop-blur-xl border border-border/20 rounded-3xl shadow-2xl overflow-hidden relative group">
                                    {/* Replace animated gradient border with subtle hover effect */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Primary Input Section */}
                                    <div className="relative p-8 sm:p-10 bg-gradient-to-b from-slate-50/50 to-transparent">
                                        <form onSubmit={handleSearch} className="space-y-6">
                                            <div className="space-y-3">
                                                <label htmlFor="query" className="text-lg font-medium text-foreground inline-flex items-center gap-2">
                                                    <Search className="w-5 h-5 text-primary" />
                                                    What would you like to study?
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        id="query"
                                                        type="text"
                                                        value={query}
                                                        onChange={(e) => setQuery(e.target.value)}
                                                        placeholder="e.g., John 3:16, God's love, Kingdom of Heaven"
                                                        className="w-full h-[60px] px-6 rounded-xl bg-white shadow-lg placeholder:text-muted-foreground/50 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border/5 transition-shadow hover:shadow-xl"
                                                        disabled={isSearching || isCreatingStudy}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                                <button
                                                    type="submit"
                                                    disabled={isSearching || isCreatingStudy || !query.trim()}
                                                    className={cn(
                                                        "order-2 sm:order-1 flex-1 h-[52px] rounded-xl font-medium flex items-center justify-center gap-3 text-[15px] transition-all relative group overflow-hidden shadow-lg hover:shadow-xl",
                                                        isAuthenticated
                                                            ? "bg-primary text-white disabled:opacity-50"
                                                            : "bg-primary text-white disabled:opacity-50"
                                                    )}
                                                >
                                                    <span className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    {isSearching || isCreatingStudy ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            <span>
                                                                {isSearching ? 'Searching...' : 'Creating study...'}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {isAuthenticated ? (
                                                                <>
                                                                    <Bot className="w-5 h-5" />
                                                                    <span>Generate Study</span>
                                                                    <Sparkles className="w-4 h-4 opacity-50" />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Lock className="w-5 h-5" />
                                                                    <span>Sign in to Generate Study</span>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </button>

                                                <div className="order-1 sm:order-2 relative">
                                                    <select
                                                        value={translation}
                                                        onChange={(e) => setTranslation(e.target.value as Translation)}
                                                        className="w-full sm:w-[240px] h-[52px] px-4 pr-10 rounded-xl bg-white text-[15px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border/5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                                                        disabled={isSearching || isCreatingStudy}
                                                    >
                                                        {TRANSLATIONS.map((t) => (
                                                            <option key={t.id} value={t.id}>{t.name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 rotate-90 pointer-events-none" />
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="p-4 rounded-xl bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-600 text-sm">
                                                    {error}
                                                </div>
                                            )}
                                        </form>
                                    </div>

                                    {/* Secondary Content - Quick Ideas */}
                                    <div className="border-t border-border/40">
                                        <div className="px-8 sm:px-10 py-8 text-muted-foreground">
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <Lightbulb className="w-4 h-4 text-primary" />
                                                </div>
                                                <h3 className="text-base font-medium text-foreground">Quick Ideas & Examples</h3>
                                            </div>
                                            <div className="space-y-6">
                                                <div>
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
                                                                className="px-4 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 text-sm transition-all hover:shadow-md relative group overflow-hidden"
                                                            >
                                                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                                                                <span className="relative">{idea}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    {[
                                                        {
                                                            text: "What does Philippians 4:6-7 teach about anxiety and peace?",
                                                            description: "Deep dive into specific verses",
                                                            icon: BookOpen
                                                        },
                                                        {
                                                            text: "Compare Jesus's parables about the Kingdom of Heaven",
                                                            description: "Thematic analysis",
                                                            icon: Filter
                                                        }
                                                    ].map((prompt) => (
                                                        <button
                                                            key={prompt.text}
                                                            onClick={() => setQuery(prompt.text)}
                                                            className="p-4 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] text-left group transition-all hover:shadow-lg relative overflow-hidden"
                                                        >
                                                            <span className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                                            <div className="relative flex gap-3">
                                                                <div className="shrink-0 p-2 rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                                                                    <prompt.icon className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">{prompt.text}</p>
                                                                    <p className="text-xs mt-1.5 text-muted-foreground/70">{prompt.description}</p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pro Tips Section - More sophisticated */}
                                <div className="bg-white/90 backdrop-blur-xl border border-border/40 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <div className="relative">
                                        <h3 className="text-base font-medium text-foreground flex items-center gap-2 mb-6">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <Sparkles className="w-4 h-4 text-primary" />
                                            </div>
                                            Pro Tips
                                        </h3>
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            {[
                                                {
                                                    tips: [
                                                        "Be specific with your questions",
                                                        "Include multiple verses for comparison"
                                                    ],
                                                    icon: Filter
                                                },
                                                {
                                                    tips: [
                                                        "Ask about historical context",
                                                        "Request practical applications"
                                                    ],
                                                    icon: Globe
                                                }
                                            ].map((section, idx) => (
                                                <div key={idx} className="space-y-3">
                                                    {section.tips.map((tip, tipIdx) => (
                                                        <div key={tipIdx} className="flex items-start gap-3">
                                                            <div className="shrink-0 p-1.5 rounded-lg bg-primary/10 mt-0.5">
                                                                <section.icon className="w-3 h-3 text-primary" />
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{tip}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'studies' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <h2 className="font-serif text-xl sm:text-2xl">My Bible Studies</h2>
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-sm font-medium shadow-sm"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        New Study
                                    </button>
                                </div>

                                {isLoadingStudies ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : userStudies.length === 0 ? (
                                    <div className="text-center py-16 px-4">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                                            <BookOpen className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="font-serif text-lg mb-2">No studies yet</h3>
                                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                            Start your first Bible study by selecting "Create Study" above
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {userStudies.slice((currentPage - 1) * studiesPerPage, currentPage * studiesPerPage).map((study) => (
                                                <button
                                                    key={study._id}
                                                    onClick={() => navigateWithTransition(`/study/bible-study/${study._id}`)}
                                                    className="group relative p-5 rounded-xl border border-border/50 bg-white/90 backdrop-blur-sm hover:border-primary/50 transition-all text-left shadow-sm hover:shadow-lg"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="relative flex items-start gap-3">
                                                        <div className="shrink-0 p-2 rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                                                            <BookOpen className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-serif group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                                                {study.query}
                                                            </h3>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Clock className="w-3 h-3" />
                                                                <span className="truncate">{formatDate(study.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {userStudies.length > studiesPerPage && (
                                            <div className="flex justify-center gap-1 mt-8">
                                                {Array.from({ length: Math.ceil(userStudies.length / studiesPerPage) }).map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentPage(i + 1)}
                                                        className={cn(
                                                            "w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all",
                                                            currentPage === i + 1
                                                                ? "bg-primary text-white shadow-sm"
                                                                : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
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

                        {activeTab === 'insights' && (
                            <div className="space-y-8">
                                <h2 className="font-serif text-2xl sm:text-3xl">Study Insights</h2>

                                {isLoadingContext ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <>
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
                                                <div key={stat.title} className="group relative p-6 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm transition-all">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="relative">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="p-2 rounded-lg bg-primary/10">
                                                                <stat.icon className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <h3 className="text-sm font-medium text-muted-foreground font-serif">{stat.title}</h3>
                                                        </div>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-2xl font-bold font-serif">{stat.value}</span>
                                                            <span className="text-sm text-muted-foreground font-serif">{stat.description}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {/* Reading Progress */}
                                            <div className="group relative p-6 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm space-y-6">
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="relative">
                                                    <div className="flex items-center gap-2 mb-6">
                                                        <div className="p-2 rounded-lg bg-primary/10">
                                                            <BookOpen className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <h3 className="font-serif text-lg">Reading Progress</h3>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex justify-between text-sm mb-2">
                                                                <span className="text-muted-foreground font-serif">Old Testament</span>
                                                                <span className="font-medium font-serif">
                                                                    {Math.round(userContext?.bibleCoverage
                                                                        ?.filter((b: any) => b.book !== 'Matthew' &&
                                                                            !b.book.startsWith('1') && !b.book.startsWith('2') &&
                                                                            !b.book.startsWith('3'))
                                                                        ?.reduce((acc: number, book: any) =>
                                                                            acc + (book.chaptersRead.length / BIBLE_STRUCTURE[book.book as keyof typeof BIBLE_STRUCTURE].chapters), 0) * 100 / 39 || 0
                                                                    )}%
                                                                </span>
                                                            </div>
                                                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary rounded-full"
                                                                    style={{
                                                                        width: `${Math.round(userContext?.bibleCoverage
                                                                            ?.filter((b: any) => b.book !== 'Matthew' &&
                                                                                !b.book.startsWith('1') && !b.book.startsWith('2') &&
                                                                                !b.book.startsWith('3'))
                                                                            ?.reduce((acc: number, book: any) =>
                                                                                acc + (book.chaptersRead.length / BIBLE_STRUCTURE[book.book as keyof typeof BIBLE_STRUCTURE].chapters), 0) * 100 / 39 || 0
                                                                        )}%`
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between text-sm mb-2">
                                                                <span className="text-muted-foreground font-serif">New Testament</span>
                                                                <span className="font-medium font-serif">
                                                                    {Math.round(userContext?.bibleCoverage
                                                                        ?.filter((b: any) => b.book === 'Matthew' ||
                                                                            b.book.startsWith('1') || b.book.startsWith('2') ||
                                                                            b.book.startsWith('3'))
                                                                        ?.reduce((acc: number, book: any) =>
                                                                            acc + (book.chaptersRead.length / BIBLE_STRUCTURE[book.book as keyof typeof BIBLE_STRUCTURE].chapters), 0) * 100 / 27 || 0
                                                                    )}%
                                                                </span>
                                                            </div>
                                                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary rounded-full"
                                                                    style={{
                                                                        width: `${Math.round(userContext?.bibleCoverage
                                                                            ?.filter((b: any) => b.book === 'Matthew' ||
                                                                                b.book.startsWith('1') || b.book.startsWith('2') ||
                                                                                b.book.startsWith('3'))
                                                                            ?.reduce((acc: number, book: any) =>
                                                                                acc + (book.chaptersRead.length / BIBLE_STRUCTURE[book.book as keyof typeof BIBLE_STRUCTURE].chapters), 0) * 100 / 27 || 0
                                                                        )}%`
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Study Focus */}
                                            <div className="group relative p-6 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="relative">
                                                    <div className="flex items-center gap-2 mb-6">
                                                        <div className="p-2 rounded-lg bg-primary/10">
                                                            <Filter className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <h3 className="font-serif text-lg">Recent Focus</h3>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="text-sm text-muted-foreground font-serif">Most studied themes:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(userContext?.favoriteTopics || ["Wisdom", "Love", "Faith", "Prayer"]).slice(0, 6).map((theme: string) => (
                                                                <span key={theme} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-serif capitalize">
                                                                    {theme}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {userContext?.notes?.length > 0 && (
                                                            <div className="mt-6">
                                                                <p className="text-sm text-muted-foreground font-serif mb-3">Recent Notes:</p>
                                                                <div className="space-y-2">
                                                                    {userContext.notes.slice(-2).map((note: any, index: number) => (
                                                                        <div key={index} className="text-sm bg-muted/50 rounded-lg p-3">
                                                                            <p className="text-muted-foreground font-serif line-clamp-2">{note.content}</p>
                                                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                                                {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <p className="text-sm text-muted-foreground font-serif mt-4">
                                                            Suggestion: Consider exploring {
                                                                userContext?.bibleCoverage?.length === 0
                                                                    ? "the Gospels"
                                                                    : userContext?.bibleCoverage?.some((b: any) => b.book === "Psalms")
                                                                        ? "Prophetic books"
                                                                        : "Psalms"
                                                            } next
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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
