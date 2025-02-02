import { Bot } from 'lucide-react';
import Link from 'next/link';

export default function AIPage() {
    return (
        <main className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <Bot className="w-16 h-16 text-primary mx-auto mb-8" />
                    <h1 className="font-serif text-4xl md:text-5xl mb-6">Christian AI Tools</h1>
                    <p className="text-xl text-muted-foreground mb-12 font-serif leading-relaxed">
                        AI-powered tools to help you explore and understand the Christian faith through Reformed Presuppositional Apologetics.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Link href="/ai/chat" className="group">
                            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all">
                                <h2 className="text-2xl font-serif mb-3 group-hover:text-primary transition-colors">Chat Assistant</h2>
                                <p className="text-muted-foreground">
                                    Have a conversation with an AI trained in Reformed theology to explore questions about faith and doctrine.
                                </p>
                            </div>
                        </Link>

                        <Link href="/ai/bible-study" className="group">
                            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all">
                                <h2 className="text-2xl font-serif mb-3 group-hover:text-primary transition-colors">Bible Study</h2>
                                <p className="text-muted-foreground">
                                    Generate AI-powered Bible studies by exploring themes, topics, or specific verses with cross-references.
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
} 