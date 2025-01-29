import { getServerWixClient } from "../serverWixClient";
import { BlogPosts } from '../../components/BlogPosts';
import { SearchBox } from '../../components/SearchBox';

interface BlogPost {
    _id: string;
    title: string;
    coverImage: string;
    excerpt?: string;
    content?: string;
    slug?: string;
    tags?: string[];
}

export default async function BlogPage() {
    const wixClient = getServerWixClient();
    const response = await wixClient.items
        .query('Blog/Posts')
        .limit(12)
        .find();

    const blogs = response.items as BlogPost[];

    return (
        <main className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-2xl">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Articles & Insights</h1>
                        <p className="text-lg text-muted-foreground mb-12 font-serif leading-relaxed">
                            Explore our collection of articles on Reformed Presuppositional Apologetics, biblical wisdom, and Christian thought.
                        </p>
                    </div>

                    <div className="mb-16">
                        <SearchBox />
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
        </main>
    );
} 