import { BookOpen, MessageSquare, Search, ScrollText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StudyPage() {
    return (
        <main className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat">
            {/* Hero Section */}
            <section className="relative border-b border-border/40">
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center">
                                <BookOpen className="w-7 h-7 text-primary/80" />
                            </div>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl mb-4 text-center">
                            Reformed Study Tools for{' '}
                            <span className="text-primary">Modern Faith</span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-serif leading-relaxed max-w-2xl mx-auto text-center">
                            Explore Scripture and Reformed theology through structured discussions and comprehensive Bible studies.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Theological Discussions */}
                            <Link href="/study/chat" className="group">
                                <div className="h-full p-6 bg-card/30 hover:bg-card/50 border border-border/60 rounded-2xl transition-all">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-primary/80" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-serif group-hover:text-primary transition-colors">Theological Discussions</h2>
                                            <p className="text-sm text-muted-foreground">Reformed dialogue & exploration</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Engage in thoughtful conversations about Reformed theology and apologetics, grounded in biblical truth and scholarly resources.
                                        </p>
                                        <ul className="space-y-2 text-sm text-muted-foreground/90">
                                            <li className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-md bg-primary/5 flex items-center justify-center">
                                                    <ScrollText className="w-3 h-3 text-primary/70" />
                                                </div>
                                                Presuppositional approach
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-md bg-primary/5 flex items-center justify-center">
                                                    <Search className="w-3 h-3 text-primary/70" />
                                                </div>
                                                Guided exploration
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-md bg-primary/5 flex items-center justify-center">
                                                    <BookOpen className="w-3 h-3 text-primary/70" />
                                                </div>
                                                Scripture-based answers
                                            </li>
                                        </ul>
                                        <div>
                                            <span className="inline-flex items-center gap-2 text-primary/90 text-sm font-medium">
                                                Begin Discussion
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* Bible Study */}
                            <Link href="/study/bible-study" className="group">
                                <div className="h-full p-6 bg-card/30 hover:bg-card/50 border border-border/60 rounded-2xl transition-all">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-primary/80" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-serif group-hover:text-primary transition-colors">Bible Study Guide</h2>
                                            <p className="text-sm text-muted-foreground">Systematic Scripture study</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Study Scripture systematically with tools for understanding context, cross-references, and Reformed theological implications.
                                        </p>
                                        <ul className="space-y-2 text-sm text-muted-foreground/90">
                                            <li className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-md bg-primary/5 flex items-center justify-center">
                                                    <Search className="w-3 h-3 text-primary/70" />
                                                </div>
                                                Contextual analysis
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-md bg-primary/5 flex items-center justify-center">
                                                    <ScrollText className="w-3 h-3 text-primary/70" />
                                                </div>
                                                Commentary insights
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-md bg-primary/5 flex items-center justify-center">
                                                    <BookOpen className="w-3 h-3 text-primary/70" />
                                                </div>
                                                Cross-references
                                            </li>
                                        </ul>
                                        <div>
                                            <span className="inline-flex items-center gap-2 text-primary/90 text-sm font-medium">
                                                Begin Study
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-12 md:py-16 border-t border-border/40">
                <div className="container mx-auto px-4">
                    <div className="max-w-xl mx-auto text-center">
                        <h2 className="font-serif text-xl md:text-2xl mb-3">Choose Your Path</h2>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            Start with a theological discussion or dive directly into Scripture study.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/study/chat"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-sm font-medium"
                            >
                                Discussion
                                <MessageSquare className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/study/bible-study"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-sm font-medium"
                            >
                                Bible Study
                                <BookOpen className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
} 