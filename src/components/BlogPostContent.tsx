'use client';

import { WixMediaImage } from './WixMediaImage';
import dynamic from 'next/dynamic';
import styles from './BlogPostContent.module.css';

const RichContentViewer = dynamic(
    () => import('./RichContentViewer'),
    {
        ssr: false,
        loading: () => <div>Loading content...</div>,
    }
);

interface BlogPost {
    title: string;
    coverImage?: string;
    author?: string;
    _createdDate: string;
    richContent?: any;
    content?: string;
}

export function BlogPostContent({ blog }: { blog: BlogPost }) {
    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <article>
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
                            <div className={styles.richContent}>
                                <RichContentViewer content={blog.richContent} />
                            </div>
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: blog.content || '' }} />
                        )}
                    </div>
                </article>
            </main>
        </div>
    );
} 