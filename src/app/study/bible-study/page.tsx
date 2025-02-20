'use client';

import { useState, useEffect } from 'react';
import { Bot, Loader2, Clock, Globe, BookOpen, Search, Sparkles, Filter, Star, Users, BarChart, ChevronRight, PlusCircle, Lightbulb, BookMarked } from 'lucide-react';
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

    // Update the useEffect to fetch user studies
    useEffect(() => {
        const init = async () => {
            setIsLoadingStudies(true);
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                setIsAuthenticated(!!data.user);

                // Fetch public studies
                const publicStudiesResponse = await fetch('/api/bible-study?public=true&limit=3');
                const publicStudiesData = await publicStudiesResponse.json();
                setPublicStudies(publicStudiesData.studies || []);

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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

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
                <div className="absolute inset-0 bg-[url('/bs.webp')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/40" />
                </div>
                <div className="relative container mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-32 sm:pb-32">
                    <div className="max-w-[640px] mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 mb-6 text-sm">
                            <Bot className="w-4 h-4" />
                            <span>Cutting Technology & Resources</span>
                        </div>

                        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white mb-6 tracking-tight">
                            The World’s Most Advanced Bible Study Platform
                        </h1>

                        <p className="text-white/80 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
                            Get instant insights, cross-references, and in-depth analysis for any verse, topic, or character from Scripture.
                        </p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px] -mb-32" />
            </div>

            <main className="container mx-auto px-4 sm:px-6 -mt-8 relative z-10">
                {/* Tabs in white card that overlaps the hero */}
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-1 mb-8">
                        <div className="border-b border-border/50">
                            <div className="flex -mb-px justify-center sm:justify-start">
                                <button
                                    onClick={() => setActiveTab('create')}
                                    className={cn(
                                        "px-4 sm:px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                        activeTab === 'create'
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                    )}
                                >
                                    Create Study
                                </button>
                                <button
                                    onClick={() => setActiveTab('studies')}
                                    className={cn(
                                        "px-4 sm:px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                        activeTab === 'studies'
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                    )}
                                >
                                    My Studies
                                </button>
                                <button
                                    onClick={() => setActiveTab('insights')}
                                    className={cn(
                                        "px-4 sm:px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                        activeTab === 'insights'
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                    )}
                                >
                                    Insights
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="max-w-3xl mx-auto">
                        {activeTab === 'create' && (
                            <div className="space-y-8">
                                {/* Bible Study Creation Card */}
                                <div className="bg-white/95 backdrop-blur-md border-2 border-primary/10 rounded-2xl shadow-xl overflow-hidden">
                                    {/* Primary Input Section */}
                                    <div className="p-6 sm:p-8 bg-gradient-to-b from-primary/[0.03] to-transparent">
                                        <form onSubmit={handleSearch} className="space-y-5">
                                            <div className="space-y-2">
                                                <label htmlFor="query" className="text-base font-medium text-foreground">
                                                    What would you like to study?
                                                </label>
                                                <div className="relative">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                                    <input
                                                        id="query"
                                                        type="text"
                                                        value={query}
                                                        onChange={(e) => setQuery(e.target.value)}
                                                        placeholder="e.g., John 3:16, God's love, Kin"
                                                        className="w-full h-[52px] pl-11 pr-4 rounded-2xl bg-zinc-100/80 placeholder:text-muted-foreground/50 text-[15px] focus:outline-none focus:ring-0 border-0"
                                                        disabled={isSearching || isCreatingStudy}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                                <div className="order-1 sm:order-2 relative">
                                                    <select
                                                        value={translation}
                                                        onChange={(e) => setTranslation(e.target.value as Translation)}
                                                        className="w-full sm:w-[200px] h-[52px] px-4 pr-10 rounded-2xl bg-zinc-100/80 text-[15px] appearance-none focus:outline-none focus:ring-0 border-0 cursor-pointer"
                                                        disabled={isSearching || isCreatingStudy}
                                                    >
                                                        {TRANSLATIONS.map((t) => (
                                                            <option key={t.id} value={t.id}>{t.name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 rotate-90 pointer-events-none" />
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={isSearching || isCreatingStudy || !query.trim()}
                                                    className="order-2 sm:order-1 flex-1 h-[52px] rounded-2xl bg-zinc-100/80 text-zinc-900 font-medium flex items-center justify-center gap-2 text-[15px] disabled:opacity-50 hover:bg-zinc-200/80 active:bg-zinc-300/80"
                                                >
                                                    {isSearching || isCreatingStudy ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            <span>
                                                                {isSearching ? 'Searching...' : 'Creating study...'}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Bot className="w-4 h-4" />
                                                            <span>Generate Study</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {error && (
                                                <div className="p-4 rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 text-sm">
                                                    {error}
                                                </div>
                                            )}
                                        </form>
                                    </div>

                                    {/* Secondary Content - Quick Ideas */}
                                    <div className="border-t border-border/40">
                                        <div className="px-6 sm:px-8 py-6 text-muted-foreground">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Lightbulb className="w-4 h-4" />
                                                <h3 className="text-sm font-medium">Quick Ideas & Examples</h3>
                                            </div>
                                            <div className="space-y-4">
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
                                                                className="px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 text-sm transition-colors"
                                                            >
                                                                {idea}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    {[
                                                        {
                                                            text: "What does Philippians 4:6-7 teach about anxiety and peace?",
                                                            description: "Deep dive into specific verses"
                                                        },
                                                        {
                                                            text: "Compare Jesus's parables about the Kingdom of Heaven",
                                                            description: "Thematic analysis"
                                                        }
                                                    ].map((prompt) => (
                                                        <button
                                                            key={prompt.text}
                                                            onClick={() => setQuery(prompt.text)}
                                                            className="p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] text-left group transition-all"
                                                        >
                                                            <p className="text-sm group-hover:text-primary transition-colors line-clamp-2">{prompt.text}</p>
                                                            <p className="text-xs mt-1 opacity-60">{prompt.description}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pro Tips Section - More subtle */}
                                <div className="bg-white/80 backdrop-blur-sm border border-border/40 rounded-xl p-5 shadow-md">
                                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
                                        <Sparkles className="w-4 h-4" />
                                        Pro Tips
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                        <div className="space-y-3">
                                            <p>• Be specific with your questions</p>
                                            <p>• Include multiple verses for comparison</p>
                                        </div>
                                        <div className="space-y-3">
                                            <p>• Ask about historical context</p>
                                            <p>• Request practical applications</p>
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

                                <div className="grid sm:grid-cols-3 gap-4">
                                    {[
                                        { title: "Bible Coverage", value: "23%", description: "of the Bible studied", icon: BookOpen },
                                        { title: "Study Streak", value: "4", description: "days in a row", icon: Sparkles },
                                        { title: "Total Studies", value: userStudies.length.toString(), description: "studies completed", icon: Star },
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
                                                        <span className="font-medium font-serif">35%</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                        <div className="h-full w-[35%] bg-primary rounded-full" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="text-muted-foreground font-serif">New Testament</span>
                                                        <span className="font-medium font-serif">45%</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                        <div className="h-full w-[45%] bg-primary rounded-full" />
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
                                                    {["Wisdom", "Love", "Faith", "Prayer"].map((theme) => (
                                                        <span key={theme} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-serif">
                                                            {theme}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-sm text-muted-foreground font-serif">
                                                    Suggestion: Consider exploring Prophetic books next
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
} 
