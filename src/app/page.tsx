import { getServerWixClient } from "./serverWixClient";
import { BlogPosts } from '../components/BlogPosts';
import { ArrowRight, BookOpen, Search, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
        .limit(12)
        .find();

    const blogs = response.items as BlogPost[];

    return (
        <main className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat">
            {/* Hero Section */}
            <section className="relative border-b border-border/40 bg-gradient-to-b from-background to-background/95">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 py-16 md:py-24">
                        <div className="flex flex-col justify-center">
                            <h1 className="font-serif text-5xl md:text-6xl">
                                Every fact bears{' '}
                                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                    God&apos;s stamp
                                </span>
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8 font-serif leading-relaxed max-w-xl">
                                Empowering Christians with Reformed Presuppositional Apologetics through interactive study tools, scholarly resources, and biblical wisdom.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/blog" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-base font-medium">
                                    Read Articles
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <a href="#resources" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-border hover:bg-muted transition-all text-base font-medium">
                                    Explore Resources
                                </a>
                            </div>
                        </div>
                        <div className="relative aspect-[4/3] lg:aspect-auto">
                            <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                <Image
                                    src="/header-image.jpeg"
                                    alt="Reformed Apologetics"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/50 to-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Articles Section */}
            <section id="resources" className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="max-w-2xl mb-12">
                            <h2 className="font-serif text-4xl md:text-5xl mb-4">Latest Articles</h2>
                            <p className="text-lg text-muted-foreground font-serif leading-relaxed">
                                Dive into our collection of articles on Reformed Presuppositional Apologetics, biblical wisdom, and Christian thought.
                            </p>
                        </div>
                        {blogs.length === 0 ? (
                            <div className="text-center py-8 bg-muted/50 rounded-lg">
                                <p className="text-base font-medium mb-1">No articles found</p>
                                <p className="text-sm text-muted-foreground">Please check back later for new content.</p>
                            </div>
                        ) : (
                            <BlogPosts initialPosts={blogs} />
                        )}
                    </div>
                </div>
            </section>

            {/* Study Tools Section */}
            <section className="py-16 border-t border-border/40 bg-muted/5">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="max-w-2xl mb-8">
                            <h2 className="font-serif text-3xl mb-3">Interactive Study Tools</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Deepen your understanding through guided discussions and systematic Bible study.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Link href="/study/chat" className="group">
                                <div className="p-6 bg-card/30 hover:bg-card/50 border border-border/60 rounded-xl transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-primary/80" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-serif group-hover:text-primary transition-colors">Theological Discussions</h3>
                                            <p className="text-sm text-muted-foreground">Reformed dialogue & exploration</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Engage in thoughtful conversations about Reformed theology and apologetics.
                                    </p>
                                    <span className="inline-flex items-center gap-2 text-primary/90 text-sm font-medium">
                                        Begin Discussion
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                </div>
                            </Link>
                            <Link href="/study/bible-study" className="group">
                                <div className="p-6 bg-card/30 hover:bg-card/50 border border-border/60 rounded-xl transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-primary/80" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-serif group-hover:text-primary transition-colors">Bible Study Guide</h3>
                                            <p className="text-sm text-muted-foreground">Systematic Scripture study</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Study Scripture with tools for understanding context and cross-references.
                                    </p>
                                    <span className="inline-flex items-center gap-2 text-primary/90 text-sm font-medium">
                                        Begin Study
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
} 