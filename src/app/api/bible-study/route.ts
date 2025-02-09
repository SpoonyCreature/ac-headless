import { NextRequest, NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';

export async function POST(request: NextRequest) {
    const wixClient = getServerWixClient();

    // Check authentication
    if (!wixClient.auth.loggedIn()) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const { query, translation, verses, crossReferences, explanation } = await request.json();

        // Create the Bible study
        const study = await wixClient.items.insert('biblestudy', {
            query,
            translation,
            verses: verses.map((v: any) => ({
                reference: v.reference,
                verses: v.verses
            })),
            crossReferences: [],
            explanation,
            public: false,
            notes: [],
            comments: [],
            commentaries: []
        });

        return NextResponse.json({
            studyId: study._id
        });
    } catch (error) {
        console.error('Error creating Bible study:', error);
        return NextResponse.json(
            { error: 'Failed to create Bible study' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const wixClient = getServerWixClient();
    const url = new URL(request.url);

    // Get query parameters
    const isPublic = url.searchParams.get('public') === 'true';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    try {
        let query = wixClient.items.query('biblestudy');

        // Apply filters
        if (isPublic) {
            // Get public studies
            query = query.eq('public', true);
        } else if (wixClient.auth.loggedIn()) {
            // Get user's studies
            const { member } = await wixClient.members.getCurrentMember();
            if (!member) {
                throw new Error('User not found');
            }
            query = query.eq('_owner', member._id);
        } else {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Add search if provided
        if (search) {
            query = query.contains('query', search);
        }

        // Add pagination
        query = query
            .descending('_createdDate')
            .skip((page - 1) * limit)
            .limit(limit);

        // Execute query
        const { items } = await query.find();

        return NextResponse.json({
            studies: items,
            page,
            limit,
            hasMore: items.length === limit
        });
    } catch (error) {
        console.error('Error fetching Bible studies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Bible studies' },
            { status: 500 }
        );
    }
} 
