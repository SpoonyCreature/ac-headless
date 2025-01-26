import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { createClient, OAuthStrategy } from "@wix/sdk";
import { items } from "@wix/data";
import dynamic from 'next/dynamic';
import styles from './blog.module.css';
import { WixMediaImage } from '../../components/Image/WixMediaImage';
import Header from '../../src/components/Header';
import BlogSkeleton, { ContentSkeleton } from '../../src/components/BlogSkeleton';

// Import RichContentViewer dynamically since it uses "use client"
const RichContentViewer = dynamic(
    () => import('../../src/components/RichContentViewer'),
    {
        ssr: false,
        loading: () => <ContentSkeleton />
    }
);

const myWixClient = createClient({
    modules: { items },
    auth: OAuthStrategy({
        clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID,
    }),
});

export default function BlogPost() {
    const router = useRouter();
    const { slug } = router.query;
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchBlog() {
            if (!slug) return;

            try {
                console.log('Fetching blog post:', slug);
                const response = await myWixClient.items
                    .query('Blog/Posts')
                    .eq("slug", slug)
                    .or(
                        myWixClient.items
                            .query('Blog')
                            .eq("_id", slug)
                    )
                    .find();

                console.log('Blog post response:', response);

                if (response.items && response.items.length > 0) {
                    setBlog(response.items[0]);
                    setError(null);
                } else {
                    console.log('Blog post not found');
                    setBlog(null);
                    setError('Blog post not found');
                }
            } catch (error) {
                console.error("Error fetching blog:", error);
                console.error("Error details:", {
                    name: error.name,
                    message: error.message,
                    code: error.code,
                    response: error.response,
                    stack: error.stack
                });
                setError(error.message || 'Failed to fetch blog post');
                setBlog(null);
            } finally {
                setLoading(false);
            }
        }

        fetchBlog();
    }, [slug]);

    if (loading) {
        return (
            <div className={styles.container}>
                <Head>
                    <title>Loading... - Apologetics Central</title>
                </Head>
                <Header />
                <main className={styles.main}>
                    <BlogSkeleton />
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>{error}</p>
                    <a href="/" className={styles.backLink}>← Back to Home</a>
                </div>
            </div>
        );
    }

    if (!blog) {
        return <div className={styles.container}>Blog post not found</div>;
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{blog.title} - Apologetics Central</title>
                <meta name="description" content={blog.excerpt || blog.content?.substring(0, 150)} />
            </Head>

            <Header />

            <main className={styles.main}>
                <article className={styles.article}>
                    {blog.coverImage && (
                        <div className={styles.coverImageContainer}>
                            <WixMediaImage
                                media={blog.coverImage}
                                width={1200}
                                height={630}
                                alt={blog.title}
                                objectFit="cover"
                            />
                        </div>
                    )}

                    <header className={styles.header}>
                        <h1 className={styles.title}>{blog.title}</h1>
                        <div className={styles.metadata}>
                            {blog.author && <span>By {blog.author}</span>}
                            <span>{new Date(blog._createdDate).toLocaleDateString()}</span>
                        </div>
                    </header>

                    <div className={styles.content}>
                        {blog.richContent ? (
                            <RichContentViewer content={blog.richContent} />
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                        )}
                    </div>
                </article>
            </main>
        </div>
    );
} 