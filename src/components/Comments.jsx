import { useEffect, useState } from 'react';
import { createClient, OAuthStrategy } from '@wix/sdk';
import { comments } from '@wix/comments';
import styles from './Comments.module.css';

const WIX_BLOG_APP_ID = '14bcded7-0066-7c35-14d7-466cb3f09103';

const wixClient = createClient({
    modules: { comments },
    auth: OAuthStrategy({
        clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID,
    }),
});

export default function Comments({ contextId, resourceId }) {
    console.log('Comments component rendered with:', { contextId, resourceId });
    const [commentsList, setCommentsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        async function fetchComments() {
            if (!contextId || !resourceId) return;

            const appId = WIX_BLOG_APP_ID;
            const options = {
                contextId,
                resourceId,
                sort: {
                    fieldName: 'createdDate',
                    order: 'DESC'
                }
            };

            try {
                console.log('Fetching comments with:', { contextId, resourceId });
                const response = await wixClient.comments.listCommentsByResource(
                    appId,
                    options
                );
                console.log('Comments response:', response);
                setCommentsList(response.comments || []);
                setError(null);
            } catch (error) {
                console.error('Error fetching comments:', error);
                setError('Failed to load comments');
            } finally {
                setLoading(false);
            }
        }

        fetchComments();
    }, [contextId, resourceId]);

    async function handleSubmitComment(e, parentCommentId = null) {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            console.log('Creating comment:', { contextId, resourceId, newComment });
            const comment = {
                appId: WIX_BLOG_APP_ID,
                content: {
                    richContent: {
                        nodes: [{
                            type: 'PARAGRAPH',
                            nodes: [{
                                type: 'TEXT',
                                textData: { text: newComment }
                            }]
                        }]
                    }
                },
                contextId,
                resourceId
            };

            const response = await wixClient.comments.createComment(comment);
            console.log('Comment created:', response);
            setNewComment('');
            // Refresh comments list
            const appId = WIX_BLOG_APP_ID;
            const options = {
                contextId,
                resourceId,
                sort: {
                    fieldName: 'createdDate',
                    order: 'DESC'
                }
            };
            const updatedComments = await wixClient.comments.listCommentsByResource(appId, options);
            setCommentsList(updatedComments.comments || []);
        } catch (err) {
            console.error('Error posting comment:', err);
            setError('Failed to post comment');
        }
    }

    if (loading) return <div className={styles.loading}>Loading comments...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.commentsSection}>
            <h3>Comments ({commentsList.length})</h3>

            <form onSubmit={handleSubmitComment} className={styles.commentForm}>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className={styles.commentInput}
                />
                <button type="submit" className={styles.submitButton}>
                    Post Comment
                </button>
            </form>

            <div className={styles.commentsList}>
                {commentsList.length === 0 ? (
                    <div className={styles.noComments}>No comments yet. Be the first to comment!</div>
                ) : (
                    commentsList.map((comment) => (
                        <div key={comment._id} className={styles.comment}>
                            <div className={styles.commentContent}>
                                {comment.content?.richContent?.nodes?.[0]?.nodes?.[0]?.textData?.text || ''}
                            </div>
                            <div className={styles.commentMeta}>
                                <span>{new Date(comment._createdDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
} 