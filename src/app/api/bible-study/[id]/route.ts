import { NextRequest, NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const wixClient = getServerWixClient();

    try {
        const { items } = await wixClient.items
            .query('biblestudy')
            .eq('_id', params.id)
            .find();

        if (items.length === 0) {
            return NextResponse.json(
                { error: 'Bible study not found' },
                { status: 404 }
            );
        }

        const study = items[0];

        // Check if user has access
        if (!study.public && (!wixClient.auth.loggedIn() || study._owner !== wixClient.auth.currentUser?._id)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json({ study });
    } catch (error) {
        console.error('Error fetching Bible study:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Bible study' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const wixClient = getServerWixClient();

    // Check authentication
    if (!wixClient.auth.loggedIn()) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        // Get the study first
        const { items } = await wixClient.items
            .query('biblestudy')
            .eq('_id', params.id)
            .find();

        if (items.length === 0) {
            return NextResponse.json(
                { error: 'Bible study not found' },
                { status: 404 }
            );
        }

        const study = items[0];

        // Check if user owns the study
        if (study._owner !== wixClient.auth.currentUser?._id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get update data
        const updates = await request.json();

        // Update the study
        const updatedStudy = await wixClient.items.update('biblestudy', {
            ...study,
            ...updates,
            _id: study._id // Ensure we don't change the ID
        });

        return NextResponse.json({ study: updatedStudy });
    } catch (error) {
        console.error('Error updating Bible study:', error);
        return NextResponse.json(
            { error: 'Failed to update Bible study' },
            { status: 500 }
        );
    }
} 