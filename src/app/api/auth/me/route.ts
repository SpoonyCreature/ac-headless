import { NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { members } from '@wix/members';
import { cookies } from 'next/headers';
import { WIX_SESSION_COOKIE_NAME } from '@/src/constants/constants';

console.log('Debug - /api/auth/me route module loaded');

export async function GET() {
    console.log('Debug - /api/auth/me GET handler started');

    try {
        // Debug: Log cookie information
        const cookieStore = cookies();
        const wixSessionCookie = cookieStore.get(WIX_SESSION_COOKIE_NAME);
        console.log('Debug - WixSession Cookie:', {
            exists: !!wixSessionCookie,
            name: wixSessionCookie?.name,
            value: wixSessionCookie?.value ? '[REDACTED]' : undefined,
        });

        const wixClient = getServerWixClient();

        // Debug: Log auth status
        const isLoggedIn = wixClient.auth.loggedIn();
        console.log('Debug - Auth Status:', { isLoggedIn });

        if (!isLoggedIn) {
            console.log('Debug - Not logged in, returning null user');
            return NextResponse.json({ user: null });
        }

        console.log('Debug - Attempting to get current member');
        try {
            const { member } = await wixClient.members.getCurrentMember({
                fieldsets: [members.Set.FULL]
            });

            // Debug: Log member info
            console.log('Debug - Member found:', {
                memberId: member?._id,
                hasProfile: !!member?.profile,
                status: member?.status,
                privacyStatus: member?.privacyStatus
            });

            return NextResponse.json({ user: member });
        } catch (memberError) {
            console.error('Debug - Error getting member:', {
                error: memberError instanceof Error ? memberError.message : 'Unknown error',
                stack: memberError instanceof Error ? memberError.stack : undefined
            });
            return NextResponse.json({ user: null });
        }
    } catch (error) {
        // Debug: Log detailed error
        console.error('Error checking auth status:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ user: null });
    }
} 