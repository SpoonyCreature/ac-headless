import { getServerWixClient } from "./serverWixClient";
import { BlogPosts } from '../components/BlogPosts';
import { ArrowRight, BookOpen, MessageSquare, Shield, Book, Users, Sparkles, Globe, Brain, Cross, ChevronDown, ArrowUpRight, Check, Image as ImageIcon, User, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/src/lib/utils';
import { WixMediaImage } from '@/src/components/WixMediaImage';
import React from 'react';

interface BlogPost {
    _id: string;
    title: string;
    coverImage: string;
    excerpt?: string;
    content?: string;
    slug?: string;
    author?: {
        _id: string;
        name: string;
        image?: string;
    };
    type?: 'article' | 'nugget';
    tags?: string[];
    readingTime?: string;
    publishedDate?: string;
}

// Keep the main page as a server component
export default async function Home() {
    const wixClient = getServerWixClient();
    const response = await wixClient.items
        .query('Blog/Posts')
        .limit(12)
        .find();

    const blogs = response.items as BlogPost[];

    return (
        <main className="min-h-screen bg-white antialiased">
            {/* Introductory Header */}
            <section className="relative bg-[#0A1A3B] overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0A1A3B] via-[#132B5F] to-[#1E3A7B] opacity-90" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015]" />
                </div>
                <div className="container mx-auto px-4 py-16 sm:py-20 md:py-28">
                    <div className="relative max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        <div className="flex-1 text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6 sm:mb-8">
                                <Brain className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" />
                                <span className="text-base sm:text-sm text-white">Grounded in Reformed Theology</span>
                            </div>
                            <h1 className="font-serif text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white font-medium tracking-[-0.02em] leading-[1.1] mb-8 sm:mb-8">
                                Deepen Your Understanding of God's Word
                            </h1>
                            <p className="text-lg sm:text-lg md:text-xl text-white/80 leading-relaxed mb-10 sm:mb-10 max-w-2xl">
                                Elevate your theological knowledge and biblical understanding through trusted Reformed resources and AI-powered study tools.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-5 sm:gap-4 justify-start">
                                <Link
                                    href="/study/bible-study"
                                    className="group inline-flex items-center justify-center h-14 sm:h-14 px-6 sm:px-8 font-medium text-[#0A1A3B] bg-white rounded-xl hover:bg-white/90 transition-all hover:scale-[1.02] hover:shadow-lg text-lg sm:text-base"
                                >
                                    <BookOpen className="w-6 h-6 sm:w-5 sm:h-5 mr-3 text-primary" />
                                    <span>Bible Study</span>
                                    <ArrowRight className="ml-2 h-5 w-5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link
                                    href="/study/chat"
                                    className="group inline-flex items-center justify-center h-14 sm:h-14 px-6 sm:px-8 font-medium text-white bg-white/10 rounded-xl hover:bg-white/15 transition-all hover:scale-[1.02] border border-white/10 hover:border-white/20 hover:shadow-lg shadow-white/5 text-lg sm:text-base"
                                >
                                    <MessageSquare className="w-6 h-6 sm:w-5 sm:h-5 mr-3 text-white/70" />
                                    <span>Ask Questions</span>
                                    <ArrowRight className="ml-2 h-5 w-5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                            <div className="mt-12 sm:mt-12 pt-12 sm:pt-12 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-8">
                                <div className="text-left">
                                    <div className="text-base sm:text-sm uppercase tracking-wider text-white/60 mb-2 sm:mb-1">Study</div>
                                    <div className="text-lg sm:text-base text-white/90">Verse-by-Verse Insights</div>
                                </div>
                                <div className="text-left">
                                    <div className="text-base sm:text-sm uppercase tracking-wider text-white/60 mb-2 sm:mb-1">Ask</div>
                                    <div className="text-lg sm:text-base text-white/90">Reformed Answers</div>
                                </div>
                                <div className="text-left">
                                    <div className="text-base sm:text-sm uppercase tracking-wider text-white/60 mb-2 sm:mb-1">Learn</div>
                                    <div className="text-lg sm:text-base text-white/90">Trusted Resources</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Subscription Section */}
            <section className="relative py-20 sm:py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.primary/0.05),transparent)]" />

                <div className="relative container mx-auto px-4">
                    <div className="max-w-[1200px] mx-auto">
                        {/* Header */}
                        <div className="text-left mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-6">
                                <Brain className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-primary">Advanced Study Tools</span>
                            </div>
                            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-slate-900 mb-4">
                                Take Your Bible Study to the Next Level
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl">
                                Access comprehensive study tools and AI-powered insights grounded in Reformed theology to deepen your understanding of Scripture.
                            </p>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                            {[
                                {
                                    icon: BookOpen,
                                    title: 'In-Depth Study',
                                    description: 'Comprehensive verse analysis and cross-references'
                                },
                                {
                                    icon: MessageSquare,
                                    title: 'Reformed Q&A',
                                    description: 'Get answers grounded in sound doctrine'
                                },
                                {
                                    icon: Book,
                                    title: 'Study Library',
                                    description: 'Curated Reformed theological resources'
                                }
                            ].map((feature, index) => (
                                <div key={index} className="group p-4 rounded-xl bg-white border border-slate-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all">
                                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        {React.createElement(feature.icon, {
                                            className: "h-5 w-5 text-primary"
                                        })}
                                    </div>
                                    <h3 className="font-medium text-slate-900 mb-1">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center h-12 px-8 font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                            >
                                Start Free Trial
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center h-12 px-8 font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all hover:scale-[1.02]"
                            >
                                View Plans
                                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Library Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-[1200px] mx-auto">
                        {blogs.length > 0 && (
                            <div>
                                <div className="text-left mb-12">
                                    <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 mb-4">Library</h2>
                                    <p className="text-lg text-slate-600 max-w-2xl">
                                        Dive deeper into our collection of theological insights, biblical interpretations, and contemporary analysis.
                                    </p>
                                </div>
                                <div className="grid gap-8">
                                    <BlogPosts initialPosts={blogs} />
                                </div>
                                <div className="mt-12">
                                    <Link
                                        href="/blog"
                                        className="inline-flex items-center justify-center h-12 px-8 font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors group"
                                    >
                                        Browse All Articles
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
} 