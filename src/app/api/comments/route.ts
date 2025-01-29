import { NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';

const WIX_BLOG_APP_ID = '14bcded7-0066-7c35-14d7-466cb3f09103';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const contextId = searchParams.get('contextId');
    const resourceId = searchParams.get('resourceId');

    if (!contextId || !resourceId) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const wixClient = getServerWixClient();
        const { comments, commentReplies } = await wixClient.comments.listCommentsByResource(
            WIX_BLOG_APP_ID,
            {
                contextId,
                resourceId,
                cursorPaging: {
                    repliesLimit: 10
                }
            }
        );

        return NextResponse.json({ comments, commentReplies });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const wixClient = getServerWixClient();
        const body = await request.json();
        const { content, contextId, resourceId, parentComment } = body;

        if (!content || !contextId || !resourceId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log("CONTENT SUBMISSION", body);

        const comment = await wixClient.comments.createComment({
            appId: WIX_BLOG_APP_ID,
            content,
            contextId,
            resourceId,
            parentComment
        });

        return NextResponse.json({ comment });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
} 