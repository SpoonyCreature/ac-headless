import { getServerWixClient } from "@/src/app/serverWixClient";
import { Metadata } from "next";
import { BlogPostContent } from "@/src/components/BlogPostContent";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const response = await getServerWixClient().items
        .query('Blog/Posts')
        .eq("slug", params.slug)
        .or(
            getServerWixClient().items
                .query('Blog')
                .eq("_id", params.slug)
        )
        .find();

    const blog = response.items[0];

    return {
        title: blog?.title ? `${blog.title} - Apologetics Central` : 'Blog Post - Apologetics Central',
        description: blog?.excerpt || blog?.content?.substring(0, 150),
    };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
    const response = await getServerWixClient().items
        .query('Blog/Posts')
        .eq("slug", params.slug)
        .or(
            getServerWixClient().items
                .query('Blog')
                .eq("_id", params.slug)
        )
        .find();

    const blog = response.items[0];

    if (!blog) {
        return (
            <div className="container">
                <div className="error">
                    <p>Blog post not found</p>
                    <a href="/" className="backLink">← Back to Home</a>
                </div>
            </div>
        );
    }

    return <BlogPostContent blog={blog} />;
} 