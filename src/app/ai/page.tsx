import { Bot } from 'lucide-react';

export default function AIPage() {
    return (
        <main className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <Bot className="w-16 h-16 text-primary mx-auto mb-8" />
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Christian AI Q&A</h1>
                    <p className="text-xl text-muted-foreground mb-8 font-serif leading-relaxed">
                        Coming soon: An AI-powered assistant trained in Reformed Presuppositional Apologetics to help answer your questions about the Christian faith.
                    </p>
                    <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
                        <p className="text-lg font-medium mb-2">🚧 Under Development</p>
                        <p className="text-muted-foreground">
                            We&apos;re working hard to bring you an intelligent assistant that can help you explore and understand Reformed Apologetics. Check back soon!
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
} 