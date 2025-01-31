import { NextRequest, NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { members } from '@wix/members';

export async function GET(request: NextRequest) {
    const wixClient = getServerWixClient();

    if (!wixClient.auth.loggedIn()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get the current user
        const { member } = await wixClient.members.getCurrentMember({
            fieldsets: [members.Set.FULL]
        });

        if (!member) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get the user's private chats
        const { items } = await wixClient.items
            .query('gptthread')
            .eq('_owner', member._id)
            .find();

        return NextResponse.json({ chats: items });
    } catch (error) {
        console.error('Error fetching private chats:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 
