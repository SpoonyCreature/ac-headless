import { getServerWixClient } from "@/src/app/serverWixClient";
import { Metadata } from "next";
import { BlogPostContent } from "@/src/components/BlogPostContent";
import Link from 'next/link';

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
    const wixClient = getServerWixClient();
    const response = await wixClient.items
        .query('Blog/Posts')
        .eq('slug', params.slug)
        .find();

    const post = response.items[0] as BlogPost;


    const authorResponse = await getServerWixClient().items.query('Members/PublicData').eq('_id', post.author).find();
    const author = authorResponse.items[0];
    console.log("AUTHPR", author);

    post.author = author;

    if (!post) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
                    <p className="mb-8">Sorry, we couldn&apos;t find the blog post you&apos;re looking for.</p>
                    <Link href="/blog" className="text-blue-600 hover:underline">
                        Return to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <BlogPostContent blog={post} />
        </div>
    );
} 