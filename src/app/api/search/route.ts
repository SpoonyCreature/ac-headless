import { NextResponse } from 'next/server';
import { getServerWixClient } from '../../serverWixClient';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('q');

    if (!term) {
        return NextResponse.json({ items: [] });
    }

    try {
        const wixClient = getServerWixClient();
        const response = await wixClient.siteSearch.search(
            { search: { expression: term } },
            // @ts-ignore
            'BLOG_POSTS'
        );

        // Extract IDs from search results and filter out any undefined values
        const postIds = response.siteDocumentItems
            .map(item => item._id)
            .filter((id): id is string => id !== undefined);

        console.log("postIds", postIds);

        if (postIds.length === 0) {
            return NextResponse.json({ items: [] });
        }

        // Query the database for the actual posts using the IDs
        const searchResults = await wixClient.items.query('Blog/Posts')
            .hasSome('uuid', postIds)
            .find();

        console.log("searchResults", searchResults);

        return NextResponse.json({ items: searchResults.items });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
    }
} 
