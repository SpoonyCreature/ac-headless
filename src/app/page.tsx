import { getServerWixClient } from "./serverWixClient";
import { SearchBox } from '../components/SearchBox';
import { BlogPosts } from '../components/BlogPosts';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import Image from 'next/image';

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
        <div className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat">
            {/* Modern Hero Section */}
            <section className="relative border-b border-border/40">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 py-16 md:py-24">
                        <div className="flex flex-col justify-center">
                            <h1 className="font-serif text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                                Every fact bears{' '}
                                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                    God&apos;s stamp
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8 font-serif leading-relaxed max-w-xl">
                                Empowering Christians with Reformed Presuppositional Apologetics through rigorous scholarship and biblical wisdom.
                            </p>
                            <div className="flex gap-4">
                                <a href="#writings" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-base font-medium">
                                    Start Reading
                                    <ArrowRight className="w-5 h-5" />
                                </a>
                                <a href="/about" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-border hover:bg-muted transition-all text-base font-medium">
                                    About Us
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

            {/* Content Section */}
            <section id="writings" className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    <h2 className="font-serif text-3xl font-bold">Latest Resources</h2>
                                </div>
                                <p className="text-muted-foreground max-w-lg font-serif">
                                    Dive into our collection of articles and nuggets of wisdom in Reformed Apologetics.
                                </p>
                            </div>
                            <SearchBox />
                        </div>

                        {blogs.length === 0 ? (
                            <div className="text-center py-8 bg-muted/50 rounded-lg">
                                <p className="text-base font-medium mb-1">No resources found</p>
                                <p className="text-sm text-muted-foreground">Please ensure you have created a &quot;Blog/Posts&quot; collection with content.</p>
                            </div>
                        ) : (
                            <BlogPosts initialPosts={blogs} />
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
} 