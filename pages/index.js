import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { createClient, OAuthStrategy } from "@wix/sdk";
import { items } from "@wix/data";
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { WixMediaImage } from '../components/Image/WixMediaImage';
import Header from '../src/components/Header';

// Create the client outside the component
const myWixClient = createClient({
  modules: { items },
  auth: OAuthStrategy({
    clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID,
  }),
});

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchBlogs() {
    try {
      console.log('Fetching blogs...');
      let response = await myWixClient.items
        .query('Blog/Posts')
        .limit(10)
        .find();

      if (response.items && response.items.length > 0) {
        setBlogs(response.items);
        setError(null);
      } else {
        setBlogs([]);
        setError('No blogs found in the collection');
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError(error.message || 'Failed to fetch blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>Apologetics Central</title>
        <meta name="description" content="Apologetics Central - Reformed Presuppositional Apologetics" />
      </Head>

      <Header />

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

          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search writings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {loading ? (
            <div className={styles.error}>Loading writings...</div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
              <p>Please make sure you have created a "Blog/Posts" collection and added some posts.</p>
            </div>
          ) : (
            <div className={styles.blogGrid}>
              {filteredBlogs.map((blog) => (
                <article key={blog._id} className={styles.blogCard} onClick={() => window.location.href = `/blog/${blog.slug || blog._id}`}>
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
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
