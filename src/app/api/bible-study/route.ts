import { NextRequest, NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { BIBLE_STRUCTURE } from '@/src/lib/bible';
import { UserContext } from '@/src/types/userContext';
import { generateBibleStudyNote } from '@/src/lib/user-notes';
import { updateBibleCoverage } from '@/src/lib/bible-study';
import type { BibleStudy } from '@/src/types/bible';

export async function POST(request: NextRequest) {
    const wixClient = getServerWixClient();

    if (!wixClient.auth.loggedIn()) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const { member } = await wixClient.members.getCurrentMember();

        if (!member?._id) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        const { query, translation, verses, crossReferences, explanation } = await request.json();

        // Create the study
        const study = await wixClient.items.insert('biblestudy', {
            query,
            translation,
            verses,
            crossReferences: crossReferences || [],
            explanation,
            _owner: member._id,
            public: false,
            notes: [],
            comments: [],
            commentaries: []
        });

        // Create a properly typed study object for note generation
        const typedStudy: BibleStudy = {
            _id: study._id,
            query: study.query,
            translation: study.translation,
            verses: study.verses,
            crossReferences: study.crossReferences,
            explanation: study.explanation,
            _owner: study._owner,
            _createdDate: study._createdDate?.toString(),
            public: study.public
        };

        // Get user context for updating
        const { items: contextItems } = await wixClient.items
            .query('userContext')
            .eq('_owner', member._id)
            .find();

        if (contextItems.length > 0) {
            const userContext = contextItems[0] as UserContext;

            // Update Bible coverage and generate note
            try {
                updateBibleCoverage(userContext, verses)
                generateBibleStudyNote(typedStudy)
            } catch (error) {
                console.error('Failed to update user context or generate study note:', error);
                // Continue to return the study ID even if context update fails
            }
        }

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
