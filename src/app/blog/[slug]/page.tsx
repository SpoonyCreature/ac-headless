import { getServerWixClient } from "@/src/app/serverWixClient";
import Link from 'next/link';
import { BlogPostContent } from "@/src/components/BlogPostContent";
import { items } from "@wix/data";

interface BlogPost {
    _id: string;
    uuid: string;
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

interface Book {
    title: string;
    image: string;
    link: string;
    displayPrice?: string;
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

        // Fetch associated books
        const booksData = await wixClient.items
            .query("PostData")
            .eq("postId", post.uuid)
            .find();

        let books: Book[] = [];
        if (booksData.items.length > 0) {
            books = booksData.items[0].books || [];
        }

        let author;
        try {
            const authorResponse = await wixClient.items.query('Members/PublicData').eq('_id', post.author).find();
            author = authorResponse.items[0];
        } catch (error) {
            console.error('Error fetching author:', error);
            author = null;
        }

        post.author = author;

        console.log(books);
        console.log(post);

        return <BlogPostContent blog={post} books={books} />;
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