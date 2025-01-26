import styles from './BlogSkeleton.module.css';

export function ContentSkeleton() {
    return (
        <div className={styles.body}>
            <div className={styles.paragraph}>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
                <div className={styles.line} style={{ width: '75%' }}></div>
            </div>
            <div className={styles.paragraph}>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
                <div className={styles.line} style={{ width: '85%' }}></div>
            </div>
            <div className={styles.paragraph}>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
                <div className={styles.line} style={{ width: '65%' }}></div>
            </div>
        </div>
    );
}

export default function BlogSkeleton() {
    return (
        <div className={styles.skeleton}>
            <div className={styles.coverImage}></div>
            <div className={styles.content}>
                <div className={styles.title}></div>
                <div className={styles.metadata}>
                    <div className={styles.metaItem}></div>
                    <div className={styles.metaItem}></div>
                </div>
                <ContentSkeleton />
            </div>
        </div>
    );
} 