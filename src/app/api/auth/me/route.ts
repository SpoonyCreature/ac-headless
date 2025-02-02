import { NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { members } from '@wix/members';
import { cookies } from 'next/headers';
import { WIX_SESSION_COOKIE_NAME } from '@/src/constants/constants';

console.log('Debug - /api/auth/me route module loaded');

export async function GET() {
    console.log('Debug - /api/auth/me GET handler started');

    try {
        const wixClient = getServerWixClient();
        console.log('Debug - Got wixClient');

        // Check if logged in first
        const isLoggedIn = wixClient.auth.loggedIn();
        console.log('Debug - Auth check:', { isLoggedIn });

        if (!isLoggedIn) {
            console.log('Debug - Not logged in, returning null user');
            return NextResponse.json({ user: null });
        }

        // Get member info
        console.log('Debug - Getting member info');
        const { member } = await wixClient.members.getCurrentMember({
            fieldsets: [members.Set.FULL]
        });

        console.log('Debug - Got member:', {
            memberId: member?._id,
            hasProfile: !!member?.profile,
            status: member?.status,
            privacyStatus: member?.privacyStatus
        });

        return NextResponse.json({ user: member });
    } catch (error) {
        console.error('Debug - Error in /api/auth/me:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ user: null });
    }
} 