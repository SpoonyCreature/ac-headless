import { getServerWixClient } from "./serverWixClient";
import { BlogPosts } from '../components/BlogPosts';
import { ArrowRight, BookOpen, Sparkles, Search, BookMarked } from 'lucide-react';
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
                                <Link href="/study" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-base font-medium">
                                    Start Studying
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

            {/* Study Tools Section */}
            <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="max-w-2xl mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <BookOpen className="w-5 h-5 text-primary" />
                                <h2 className="font-serif text-4xl md:text-5xl">Interactive Study</h2>
                            </div>
                            <p className="text-lg text-muted-foreground font-serif leading-relaxed">
                                Deepen your understanding of Scripture through our comprehensive study tools and theological discussions.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Link href="/study/chat" className="group">
                                <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all h-full">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <BookMarked className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-serif mb-3 group-hover:text-primary transition-colors">Theological Discussions</h3>
                                    <p className="text-muted-foreground">
                                        Engage in meaningful conversations about faith, doctrine, and Reformed theology with our interactive guide.
                                    </p>
                                </div>
                            </Link>
                            <Link href="/study/bible-study" className="group">
                                <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all h-full">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <Search className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-serif mb-3 group-hover:text-primary transition-colors">Bible Study Guide</h3>
                                    <p className="text-muted-foreground">
                                        Explore Scripture deeply with our interactive study tool featuring cross-references, commentary, and guided reflections.
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Articles Section */}
            <section id="resources" className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="max-w-2xl mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <h2 className="font-serif text-4xl md:text-5xl">Latest Articles</h2>
                            </div>
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
        </main>
    );
} 