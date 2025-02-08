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
    const canNest = level < 3;
    const [isReplying, setIsReplying] = useState(false);

    return (
        <div className={`relative ${level > 0 ? 'ml-8 md:ml-16' : ''}`}>
            {/* Comment thread line */}
            {level > 0 && (
                <div className="absolute left-[-24px] top-[28px] bottom-0 w-px bg-gradient-to-b from-border/40 via-border/30 to-transparent" />
            )}

            <div className="relative group">
                <div className="py-5 transition-all">
                    <div className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-medium text-sm ring-1 ring-primary/20">
                            {comment.author?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-baseline justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{comment.author.name}</span>
                                    <span className="text-xs text-muted-foreground/60">•</span>
                                    <span className="text-xs text-muted-foreground/60">{new Date(comment._createdDate).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                                {comment.contentEdited && (
                                    <span className="text-xs text-muted-foreground/50 italic">edited</span>
                                )}
                            </div>
                            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:text-foreground/90">
                                <p>{extractTextFromRichContent(comment.content)}</p>
                            </div>
                            <div className="flex items-center gap-4 pt-0.5">
                                {isAuthenticated && canNest && (
                                    <button
                                        onClick={() => setIsReplying(!isReplying)}
                                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Reply className="h-3.5 w-3.5" />
                                        {isReplying ? 'Cancel' : 'Reply'}
                                    </button>
                                )}
                                {comment.replyCount > 0 && !hasReplies && (
                                    <button
                                        onClick={() => onReply(comment._id)}
                                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isReplying && (
                    <div className="mt-3 ml-12">
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
                <div className="mt-3 space-y-3">
                    {replies.map(reply => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            replies={[]}
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/comments?contextId=${contextId}&resourceId=${resourceId}`);
            const data: CommentsResponse = await response.json();
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
        if (!newComment.trim() || !isAuthenticated || isSubmitting) return;

        try {
            setIsSubmitting(true);
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

            // Add a slight delay before refreshing comments for better UX
            setTimeout(() => {
                fetchComments();
                setIsSubmitting(false);
            }, 1500);
        } catch (error) {
            console.error('Error posting comment:', error);
            setIsSubmitting(false);
        }
    };

    const handleReply = (parentId: string) => {
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
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif tracking-tight">Discussion</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </div>
            </div>

            {isAuthenticated && (
                <form onSubmit={handleSubmitComment} className="relative">
                    <div className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-medium text-sm ring-1 ring-primary/20">
                            {/* Add user's initial here */}
                            A
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="What are your thoughts?"
                                className="w-full min-h-[120px] p-4 rounded-lg bg-transparent resize-y placeholder:text-muted-foreground/60 focus:outline-none text-base border-b border-border/40 focus:border-primary/30 transition-colors"
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || isSubmitting}
                                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting && (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    )}
                                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            <div className="space-y-6 divide-y divide-border/40">
                {commentTree.map((comment) => (
                    <div key={comment._id} className="pt-6 first:pt-0">
                        <CommentItem
                            comment={comment}
                            replies={comment.replies}
                            level={0}
                            onReply={handleReply}
                            isAuthenticated={isAuthenticated}
                        />
                    </div>
                ))}
            </div>

            {!isAuthenticated && (
                <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground mb-4">
                        Join the discussion
                    </p>
                    <LoginButton />
                </div>
            )}

            {isAuthenticated && comments.length === 0 && (
                <div className="text-center py-12 text-sm text-muted-foreground">
                    No comments yet. Be the first to start the discussion!
                </div>
            )}
        </div>
    );
} 