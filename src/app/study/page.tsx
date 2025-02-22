'use client';

import { useState, useEffect } from 'react';
import { Bot, Loader2, Clock, Globe, BookOpen, Search, Sparkles, Filter, Star, Users, BarChart, ChevronRight, PlusCircle, Lightbulb, BookMarked, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { BIBLE_STRUCTURE } from '@/src/lib/bible';

export default function StudyPage() {
    const [isLoadingContext, setIsLoadingContext] = useState(true);
    const [userContext, setUserContext] = useState<any>(null);
    const [coverage, setCoverage] = useState(0);
    const [userStudies, setUserStudies] = useState<any[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const init = async () => {
            setIsLoadingContext(true);
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                setIsAuthenticated(!!data.user);

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
                setIsLoadingContext(false);
            }
        };
        init();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <section className="bg-[#0A1A3B] py-8 sm:py-16">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="w-full max-w-2xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 mb-4 sm:mb-6">
                            <BookOpen className="w-3.5 h-3.5 text-white" />
                            <span className="text-sm text-white">Reformed Bible Study</span>
                        </div>

                        <h1 className="font-serif text-3xl sm:text-4xl text-white mb-2 sm:mb-3">Study Dashboard</h1>
                        <p className="text-white/80 text-base sm:text-lg">Track your progress and access powerful study tools</p>
                    </div>
                </div>
            </section>

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
                <div className="w-full space-y-8 sm:space-y-16">
                    {/* Study Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <Link
                            href="/study/bible-study"
                            className="group bg-white p-4 sm:p-6 rounded-xl border border-border/20"
                        >
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="shrink-0 p-2 rounded-lg bg-slate-100">
                                    <BookOpen className="w-5 h-5 text-slate-600" />
                                </div>
                                <div className="space-y-2 min-w-0">
                                    <h2 className="font-medium text-lg">Bible Study</h2>
                                    <p className="text-muted-foreground text-sm">
                                        Study Scripture with verse analysis, cross-references, and advanced commentary
                                    </p>
                                    <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                                        Start Study <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/study/chat"
                            className="group bg-white p-4 sm:p-6 rounded-xl border border-border/20"
                        >
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="shrink-0 p-2 rounded-lg bg-slate-100">
                                    <MessageSquare className="w-5 h-5 text-slate-600" />
                                </div>
                                <div className="space-y-2 min-w-0">
                                    <h2 className="font-medium text-lg">Discussion</h2>
                                    <p className="text-muted-foreground text-sm">
                                        Engage in theological discussions with source-grounded assistance
                                    </p>
                                    <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                                        Start Discussion <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-6 sm:space-y-8">
                        <h2 className="font-serif text-xl sm:text-2xl text-foreground">Study Progress</h2>

                        {isLoadingContext ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-5 h-5 animate-spin text-foreground/50" />
                            </div>
                        ) : !isAuthenticated ? (
                            <div className="text-center py-12 sm:py-16 px-4">
                                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 mb-4">
                                    <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-slate-600" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-2">Sign in to track progress</h3>
                                <p className="text-base text-muted-foreground max-w-md mx-auto">
                                    Create an account to save your studies and track your progress
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                        <div key={stat.title} className="bg-white p-4 sm:p-6 rounded-xl border border-border/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="p-2 rounded-lg bg-slate-100">
                                                    <stat.icon className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <h3 className="text-sm font-medium text-foreground/70">{stat.title}</h3>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold">{stat.value}</span>
                                                <span className="text-sm text-foreground/60">{stat.description}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Reading Progress */}
                                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-border/20">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="p-2 rounded-lg bg-slate-100">
                                                <BookOpen className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <h3 className="text-lg font-medium">Reading Progress</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-foreground/70">Old Testament</span>
                                                    <span className="font-medium">
                                                        {Math.round(userContext?.bibleCoverage
                                                            ?.filter((b: any) => b.book !== 'Matthew' &&
                                                                !b.book.startsWith('1') && !b.book.startsWith('2') &&
                                                                !b.book.startsWith('3'))
                                                            ?.reduce((acc: number, book: any) =>
                                                                acc + (book.chaptersRead.length / BIBLE_STRUCTURE[book.book as keyof typeof BIBLE_STRUCTURE].chapters), 0) * 100 / 39 || 0
                                                        )}%
                                                    </span>
                                                </div>
                                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
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
                                                    <span className="text-foreground/70">New Testament</span>
                                                    <span className="font-medium">
                                                        {Math.round(userContext?.bibleCoverage
                                                            ?.filter((b: any) => b.book === 'Matthew' ||
                                                                b.book.startsWith('1') || b.book.startsWith('2') ||
                                                                b.book.startsWith('3'))
                                                            ?.reduce((acc: number, book: any) =>
                                                                acc + (book.chaptersRead.length / BIBLE_STRUCTURE[book.book as keyof typeof BIBLE_STRUCTURE].chapters), 0) * 100 / 27 || 0
                                                        )}%
                                                    </span>
                                                </div>
                                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
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

                                    {/* Study Focus */}
                                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-border/20">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="p-2 rounded-lg bg-slate-100">
                                                <Filter className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <h3 className="text-lg font-medium">Recent Focus</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-sm text-foreground/70">Most studied themes:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(userContext?.favoriteTopics || ["Wisdom", "Love", "Faith", "Prayer"]).slice(0, 6).map((theme: string) => (
                                                    <span key={theme} className="px-3 py-1.5 rounded-lg bg-slate-100 text-foreground/90 text-sm capitalize">
                                                        {theme}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-sm text-foreground/70 mt-4">
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
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
} 