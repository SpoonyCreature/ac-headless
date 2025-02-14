import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function StudyPage() {
    return (
        <main className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <BookOpen className="w-16 h-16 text-primary mx-auto mb-8" />
                    <h1 className="font-serif text-4xl md:text-5xl mb-6">Spiritual Growth Resources</h1>
                    <p className="text-xl text-muted-foreground mb-12 font-serif leading-relaxed">
                        Deepen your understanding of Reformed theology and grow in your faith through interactive study tools and guided conversations.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Link href="/study/chat" className="group">
                            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all">
                                <h2 className="text-2xl font-serif mb-3 group-hover:text-primary transition-colors">Theological Discussions</h2>
                                <p className="text-muted-foreground">
                                    Engage in meaningful conversations about faith, doctrine, and Reformed theology with our interactive guide.
                                </p>
                            </div>
                        </Link>

                        <Link href="/study/bible-study" className="group">
                            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all">
                                <h2 className="text-2xl font-serif mb-3 group-hover:text-primary transition-colors">Bible Study Guide</h2>
                                <p className="text-muted-foreground">
                                    Explore Scripture deeply with our interactive study tool featuring cross-references, commentary, and guided reflections.
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
} 