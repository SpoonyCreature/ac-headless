import { getServerWixClient } from "@/src/app/serverWixClient";
import Header from '@/src/components/Header';
import styles from './page.module.css';
import { SearchBox } from '@/src/components/SearchBox';
import { BlogCard } from '@/src/components/BlogCard';

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
        <div className={styles.container}>

            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Every fact in this world has <span>God's stamp</span> indelibly engraved upon it
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Apologetics Central empowers Christians with Reformed Presuppositional Apologetics in defence of the faith.
                    </p>
                    <button className={styles.ctaButton}>
                        Try Apologetics Central
                    </button>
                </div>
            </section>

            <main className={styles.main}>
                <section id="writings" className={styles.writingsSection}>
                    <h2 className={styles.sectionTitle}>Latest Writings</h2>

                    <SearchBox />

                    {blogs.length === 0 ? (
                        <div className={styles.error}>
                            <p>No blogs found in the collection</p>
                            <p>Please make sure you have created a "Blog/Posts" collection and added some posts.</p>
                        </div>
                    ) : (
                        <div className={styles.blogGrid}>
                            {blogs.map((blog) => (
                                <BlogCard key={blog._id} blog={blog} />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
} 