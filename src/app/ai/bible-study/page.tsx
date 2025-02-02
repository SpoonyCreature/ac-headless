'use client';

import { useState, useEffect } from 'react';
import { Bot, Book, Search, Save, List, Menu } from 'lucide-react';
import { BibleStudyResults } from '@/src/components/BibleStudyResults';
import { BibleStudySidebar } from '@/src/components/BibleStudySidebar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    const router = useRouter();

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
            <main className="flex-1 py-16 lg:py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <Book className="w-16 h-16 text-primary mx-auto mb-6" />
                            <h1 className="font-serif text-4xl md:text-5xl mb-4">Bible Study Assistant</h1>
                            <p className="text-xl text-muted-foreground font-serif leading-relaxed mb-6">
                                Enter a topic, theme, or verse to generate a Bible study with relevant cross-references.
                            </p>
                            <Link
                                href="/ai/bible-study/list"
                                className="inline-flex items-center gap-2 text-primary hover:text-primary/90 transition-colors"
                            >
                                <List className="w-4 h-4" />
                                View All Bible Studies
                            </Link>
                        </div>

                        {/* Search Form */}
                        <form onSubmit={handleSearch} className="mb-12 space-y-4">
                            {/* Translation Selection */}
                            <div className="flex gap-4 items-center">
                                <label className="text-sm font-medium text-muted-foreground w-24">Translation:</label>
                                <select
                                    value={translation}
                                    onChange={(e) => setTranslation(e.target.value as Translation)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    {TRANSLATIONS.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Search Input */}
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Enter a topic (e.g., 'love'), theme (e.g., 'God's sovereignty'), or verse (e.g., 'John 3:16')"
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 pl-11"
                                    />
                                    <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || !query.trim()}
                                    className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {isLoading ? 'Searching...' : 'Preview'}
                                </button>
                            </div>
                        </form>

                        {/* Results */}
                        {error && (
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive mb-8">
                                {error}
                            </div>
                        )}

                        {isLoading && (
                            <div className="text-center py-12">
                                <Bot className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                                <p className="text-muted-foreground">Searching for relevant verses...</p>
                            </div>
                        )}

                        {results && !isLoading && (
                            <>
                                <BibleStudyResults results={results} />

                                {/* Create Study Button */}
                                <div className="mt-8 text-center">
                                    {isAuthenticated ? (
                                        <button
                                            onClick={handleCreateStudy}
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                                        >
                                            <Save className="w-5 h-5" />
                                            Create Bible Study
                                        </button>
                                    ) : (
                                        <p className="text-muted-foreground">
                                            Please <a href="/login" className="text-primary hover:underline">sign in</a> to create and save this Bible study
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
} 
