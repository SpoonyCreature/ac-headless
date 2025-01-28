import { getServerWixClient } from "@/src/app/serverWixClient";
import { SearchBox } from '@/src/components/SearchBox';
import { BlogCard } from '@/src/components/BlogCard';
import { ArrowRight } from 'lucide-react';

interface BlogPost {
    _id: string;
    title: string;
    coverImage: string;
    excerpt?: string;
    content?: string;
    slug?: string;
}

// Keep the main page as a server component
export default async function Home() {
    const wixClient = getServerWixClient();
    const response = await wixClient.items
        .query('Blog/Posts')
        .limit(10)
        .find();

    const blogs = response.items as BlogPost[];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background to-muted">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
                </div>
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            Every fact in this world has{' '}
                            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                God's stamp
                            </span>{' '}
                            indelibly engraved upon it
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Apologetics Central empowers Christians with Reformed Presuppositional Apologetics in defence of the faith.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#writings" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                                Start Reading
                                <ArrowRight className="w-4 h-4" />
                            </a>
                            <a href="/about" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-muted hover:bg-muted/80 transition-colors font-medium">
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section id="writings" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">Latest Writings</h2>
                                <p className="text-muted-foreground">Explore our collection of apologetic resources</p>
                            </div>
                            <SearchBox />
                        </div>

                        {blogs.length === 0 ? (
                            <div className="text-center py-12 bg-muted/50 rounded-lg">
                                <p className="text-lg font-medium mb-2">No blogs found in the collection</p>
                                <p className="text-muted-foreground">Please make sure you have created a "Blog/Posts" collection and added some posts.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {blogs.map((blog) => (
                                    <BlogCard key={blog._id} blog={blog} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
} 