'use client';

import { useRouter } from 'next/navigation';
import { WixMediaImage } from './WixMediaImage';
import styles from './BlogCard.module.css';

interface BlogPost {
    _id: string;
    title: string;
    coverImage: string;
    excerpt?: string;
    content?: string;
    slug?: string;
}

export function BlogCard({ blog }: { blog: BlogPost }) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/blog/${blog.slug || blog._id}`);
    };

    return (
        <article className={styles.blogCard} onClick={handleClick}>
            <div className={styles.blogImageContainer}>
                <WixMediaImage
                    media={blog.coverImage}
                    width={800}
                    height={450}
                    alt={blog.title || 'Blog post image'}
                    objectFit="cover"
                />
            </div>
            <div className={styles.blogContent}>
                <h3 className={styles.blogTitle}>{blog.title}</h3>
                <p className={styles.blogExcerpt}>
                    {blog.excerpt || blog.content?.substring(0, 120)}
                </p>
                <span className={styles.readMore}>
                    Read article
                </span>
            </div>
        </article>
    );
} 