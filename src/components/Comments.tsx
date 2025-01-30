'use client';

import { useEffect, useState, useCallback } from 'react';
import { LoginButton } from './LoginButton';
import { Reply, MessageSquare } from 'lucide-react';

interface CommentContent {
    richContent?: {
        nodes: Array<{
            type: string;
            nodes?: Array<{
                type: string;
                textData?: {
                    text: string;
                };
            }>;
        }>;
    };
}

interface CommentAuthor {
    id: string;
    name: string;
}

interface ParentComment {
    id: string;
}

interface Comment {
    _id: string;
    content: CommentContent;
    _createdDate: string;
    _updatedDate: string;
    appId: string;
    author: CommentAuthor;
    commentDate: string;
    contentEdited: boolean;
    contextId: string;
    marked: boolean;
    parentComment?: ParentComment;
    rating: number;
    replyCount: number;
    resourceId: string;
    revision: string;
    status: string;
}

interface PagingMetadata {
    count: number;
    offset: number;
    total: number;
}

interface RepliesListResponse {
    pagingMetadata: PagingMetadata;
    replies: Comment[];
}

interface CommentsResponse {
    comments: Comment[];
    commentReplies: Record<string, RepliesListResponse>;
}

export interface CommentsProps {
    contextId: string;
    resourceId: string;
    isAuthenticated: boolean;
}

function extractTextFromRichContent(content: CommentContent): string {
    if (!content.richContent?.nodes?.[0]?.nodes?.[0]?.textData?.text) {
        return '';
    }
    return content.richContent.nodes[0].nodes[0].textData.text;
}

interface CommentItemProps {
    comment: Comment;
    replies: Comment[];
    level: number;
    onReply: (parentId: string) => void;
    isAuthenticated: boolean;
}

function CommentItem({ comment, replies, level, onReply, isAuthenticated }: CommentItemProps) {
    const hasReplies = replies.length > 0;
    const canNest = level < 3; // Limit nesting to 3 levels
    const [isReplying, setIsReplying] = useState(false);

    return (
        <div className={`relative ${level > 0 ? 'ml-6 md:ml-12' : ''}`}>
            {/* Comment thread line */}
            {level > 0 && (
                <div className="absolute left-[-12px] top-0 bottom-0 w-[2px] bg-border/20 hover:bg-border/40 transition-colors" />
            )}

            <div className="relative group">
                <div className="py-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{comment.author.name}</span>
                        <span>•</span>
                        <span>{new Date(comment._createdDate).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                        })}</span>
                        {comment.contentEdited && (
                            <>
                                <span>•</span>
                                <span className="italic">edited</span>
                            </>
                        )}
                    </div>
                    <p className="text-sm leading-relaxed my-2">{extractTextFromRichContent(comment.content)}</p>
                    <div className="flex items-center gap-4 text-xs">
                        {isAuthenticated && canNest && (
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Reply className="h-3.5 w-3.5" />
                                {isReplying ? 'Cancel' : 'Reply'}
                            </button>
                        )}
                        {comment.replyCount > 0 && !hasReplies && (
                            <button
                                onClick={() => onReply(comment._id)}
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                            </button>
                        )}
                    </div>
                </div>

                {isReplying && (
                    <div className="mt-2 mb-4">
                        <ReplyForm
                            onSubmit={(content) => {
                                onReply(comment._id);
                                setIsReplying(false);
                            }}
                        />
                    </div>
                )}
            </div>

            {hasReplies && (
                <div className="mt-2 space-y-2">
                    {replies.map(reply => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            replies={[]} // We don't support deeper nesting
                            level={level + 1}
                            onReply={onReply}
                            isAuthenticated={isAuthenticated}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface ReplyFormProps {
    onSubmit: (content: string) => void;
}

function ReplyForm({ onSubmit }: ReplyFormProps) {
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSubmit(content);
        setContent('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full min-h-[100px] p-3 rounded-md border border-border/50 bg-background resize-y placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm"
            />
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={!content.trim()}
                    className="px-4 py-2 text-xs font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Reply
                </button>
            </div>
        </form>
    );
}

export function Comments({ contextId, resourceId, isAuthenticated }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentReplies, setCommentReplies] = useState<Record<string, Comment[]>>({});
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/comments?contextId=${contextId}&resourceId=${resourceId}`);
            const data: CommentsResponse = await response.json();
            console.log("COMMENTS DATA", data);
            setComments(data.comments);
            const replies: Record<string, Comment[]> = {};
            Object.entries(data.commentReplies).forEach(([parentId, replyData]) => {
                replies[parentId] = replyData.replies;
            });
            setCommentReplies(replies);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [contextId, resourceId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !isAuthenticated) return;

        try {
            console.log('Submitting comment with parent:', replyingTo);
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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
                    resourceId,
                    parentComment: replyingTo ? { id: replyingTo } : undefined,
                }),
            });

            if (!response.ok) throw new Error('Failed to post comment');

            // Clear the form and reset state
            setNewComment('');
            setReplyingTo(null);

            // Reload all comments
            await fetchComments();
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handleReply = (parentId: string) => {
        console.log('Replying to comment:', parentId);
        setReplyingTo(parentId);
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setNewComment('');
    };

    // Organize comments into a tree structure
    const commentTree = comments.reduce((acc, comment) => {
        // This is a top-level comment
        const replies = commentReplies[comment._id] || [];
        acc.push({ ...comment, replies });
        return acc;
    }, [] as (Comment & { replies: Comment[] })[]);

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded-md"></div>
            <div className="h-20 bg-muted rounded-md"></div>
        </div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Discussion</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </div>
            </div>

            <div className="space-y-6">
                {commentTree.map((comment) => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        replies={comment.replies}
                        level={0}
                        onReply={handleReply}
                        isAuthenticated={isAuthenticated}
                    />
                ))}
                {comments.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">
                            No comments yet. {isAuthenticated ? 'Start the discussion!' : 'Sign in to start the discussion!'}
                        </p>
                    </div>
                )}
            </div>

            {isAuthenticated ? (
                <form onSubmit={handleSubmitComment} className="space-y-4 pt-4 border-t border-border/20">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="What are your thoughts?"
                        className="w-full min-h-[120px] p-4 rounded-lg border border-border/50 bg-background resize-y placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Comment
                        </button>
                    </div>
                </form>
            ) : (
                <div className="p-6 rounded-lg bg-muted/30 border border-border/50 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                        Join the discussion by signing in
                    </p>
                    <LoginButton />
                </div>
            )}
        </div>
    );
} 