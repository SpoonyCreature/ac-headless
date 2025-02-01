import { getServerWixClient } from "@/src/app/serverWixClient";
import Link from 'next/link';
import { BlogPostContent } from "@/src/components/BlogPostContent";
import { items } from "@wix/data";

interface BlogPost {
    _id: string;
    title: string;
    coverImage?: string;
    author?: any;
    _createdDate: string;
    richContent?: {
        nodes: any[];
        metadata?: any;
    };
    content?: string;
    slug?: string;
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
    try {
        const wixClient = getServerWixClient();
        const response = await wixClient.items
            .query('Blog/Posts')
            .eq('slug', params.slug)
            .find();

        if (!response.items.length) {
            throw new Error('Post not found');
        }

        const post = response.items[0] as unknown as BlogPost;

        let author;
        try {
            const authorResponse = await wixClient.items.query('Members/PublicData').eq('_id', post.author).find();
            author = authorResponse.items[0];
        } catch (error) {
            console.error('Error fetching author:', error);
            author = null;
        }

        post.author = author;

        return <BlogPostContent blog={post} />;
    } catch (error) {
        console.error('Error loading blog post:', error);
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-4">Error Loading Blog Post</h1>
                    <p className="mb-8">Sorry, we encountered an error while loading this blog post.</p>
                    <Link href="/blog" className="text-blue-600 hover:underline">
                        Return to Blog
                    </Link>
                </div>
            </div>
        );
    }
} 