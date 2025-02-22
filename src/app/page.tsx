import { getServerWixClient } from "./serverWixClient";
import { BlogPosts } from '../components/BlogPosts';
import { ArrowRight, BookOpen, MessageSquare, Shield, Book, Users, Sparkles, Globe, Brain, Cross, ChevronDown, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { WixMediaImage } from '@/src/components/WixMediaImage';

interface BlogPost {
    _id: string;
    title: string;
    coverImage: string;
    excerpt?: string;
    content?: string;
    slug?: string;
    tags?: string[];
}

// Keep the main page as a server component
export default async function Home() {
    const wixClient = getServerWixClient();
    const response = await wixClient.items
        .query('Blog/Posts')
        .limit(6)
        .find();

    const blogs = response.items as BlogPost[];

    return (
        <main className="min-h-screen bg-white antialiased">
            {/* Hero Section - Focused value proposition */}
            <section className="relative bg-[#0A1A3B] overflow-hidden px-4">
                {/* Subtle animated gradient background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0A1A3B] via-[#132B5F] to-[#1E3A7B] opacity-90" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015]" />
                </div>

                <div className="container mx-auto px-4 py-16 sm:py-24">
                    <div className="relative max-w-[720px] mx-auto">
                        {/* Premium badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6 sm:mb-8">
                            <Brain className="w-3.5 h-3.5 text-white" />
                            <span className="text-sm text-white">Reformed Bible Study & Resources</span>
                        </div>

                        {/* Main heading with optimized typography */}
                        <h1 className="font-serif text-5xl text-white font-medium tracking-[-0.02em] leading-[1.2] mb-4 sm:mb-6">
                            Biblical Truth in a Skeptical Age
                        </h1>

                        {/* Enhanced subheading - accurate description */}
                        <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-8 sm:mb-10">
                            Source-grounded theological assistance, advanced commentary with cross-references, and visual Bible study tools
                        </p>

                        {/* Enhanced CTA section */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-10 sm:mb-12">
                            <Link
                                href="/study/bible-study"
                                className="group flex items-center justify-center gap-2 px-6 h-12 bg-white text-[#0A1A3B] rounded-lg font-medium hover:bg-white/95 transition-all"
                            >
                                Try Bible Study
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href="/study/chat"
                                className="group flex items-center justify-center gap-2 px-6 h-12 bg-white/10 text-white rounded-lg font-medium hover:bg-white/15 transition-all border border-white/10"
                            >
                                Start Discussion
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>

                    </div>
                </div>
            </section>

            {/* Main content - Clear sections with progressive disclosure */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-[1200px] mx-auto">
                        {/* Core Features */}
                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            <div className="bg-slate-50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Brain className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="font-medium text-lg">Research Assistant</h2>
                                </div>
                                <p className="text-slate-600 mb-4">
                                    Engage in theological discussions with an intelligent assistant that grounds answers in reliable sources. Share interesting conversations.
                                </p>
                                <Link
                                    href="/study/chat"
                                    className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all"
                                >
                                    <span>Start Discussion</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <BookOpen className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="font-medium text-lg">Bible Study</h2>
                                </div>
                                <p className="text-slate-600 mb-4">
                                    Advanced commentary, cross-references, and visual study tools including Sankey diagrams for deeper understanding.
                                </p>
                                <Link
                                    href="/study/bible-study"
                                    className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all"
                                >
                                    <span>Study Scripture</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Book className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="font-medium text-lg">Articles</h2>
                                </div>
                                <p className="text-slate-600 mb-4">
                                    Reformed theological articles and insights on Scripture, doctrine, and contemporary issues.
                                </p>
                                <Link
                                    href="/blog"
                                    className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all"
                                >
                                    <span>Read Articles</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Featured Articles */}
                        {blogs.length > 0 && (
                            <div>
                                <div className="flex items-end justify-between mb-8">
                                    <div>
                                        <h2 className="font-serif text-2xl text-slate-900 mb-2">Featured Articles</h2>
                                        <p className="text-slate-600">Latest theological insights and commentary</p>
                                    </div>
                                    <Link
                                        href="/blog"
                                        className="text-primary hover:text-primary/80 transition-colors"
                                    >
                                        View All
                                    </Link>
                                </div>
                                <div className="grid gap-6">
                                    <BlogPosts initialPosts={blogs} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
} 