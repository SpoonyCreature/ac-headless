import { Metadata } from 'next';
import { getServerWixClient } from "@/src/app/serverWixClient";
import Link from 'next/link';
import { BlogPostContent } from "@/src/components/BlogPostContent";
import { items } from "@wix/data";
import { notFound } from 'next/navigation';

interface BlogPost {
    _id: string;
    uuid: string;
    title: string;
    coverImage?: string;
    excerpt?: string;
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

// Shared data fetching function
async function getPostData(slug: string) {
    const wixClient = getServerWixClient();
    const response = await wixClient.items
        .query('Blog/Posts')
        .eq('slug', slug)
        .find();

    if (!response.items.length) {
        return null;
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

    // Fetch author
    let author;
    try {
        const authorResponse = await wixClient.items.query('Members/PublicData').eq('_id', post.author).find();
        author = authorResponse.items[0];
    } catch (error) {
        console.error('Error fetching author:', error);
        author = null;
    }

    post.author = author;

    return { post, books };
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    try {
        const data = await getPostData(params.slug);

        if (!data) {
            return { title: 'Post Not Found' };
        }

        const { post } = data;

        return {
            title: `${post.title} | Naked Bible`,
            description: post.excerpt,
            openGraph: {
                title: post.title,
                description: post.excerpt,
                type: 'article',
                publishedTime: post._createdDate,
                authors: post.author?.nickname,
                images: post.coverImage ? [post.coverImage] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: post.title,
                description: post.excerpt,
                images: post.coverImage ? [post.coverImage] : [],
            },
            alternates: {
                canonical: `https://nakedbible.org/blog/${params.slug}`,
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Blog Post | Naked Bible',
        };
    }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
    try {
        const data = await getPostData(params.slug);

        if (!data) {
            notFound();
        }

        const { post, books } = data;

        return (
            <article itemScope itemType="https://schema.org/BlogPosting">
                {/* Schema.org metadata */}
                <meta itemProp="headline" content={post.title} />
                {post.excerpt && <meta itemProp="description" content={post.excerpt} />}
                {post.coverImage && <meta itemProp="image" content={post.coverImage} />}
                <meta itemProp="datePublished" content={post._createdDate} />
                {post.author && (
                    <div itemProp="author" itemScope itemType="https://schema.org/Person">
                        <meta itemProp="name" content={post.author.nickname} />
                    </div>
                )}

                <BlogPostContent blog={post} books={books} />
            </article>
        );
    } catch (error) {
        console.error('Error loading blog post:', error);
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-xl mx-auto text-center">
                    <h1 className="text-2xl mb-4">Error Loading Blog Post</h1>
                    <p className="mb-8">Sorry, we encountered an error while loading this blog post.</p>
                    <Link href="/blog" className="text-blue-600 hover:underline">
                        Return to Blog
                    </Link>
                </div>
            </div>
        );
    }
} 