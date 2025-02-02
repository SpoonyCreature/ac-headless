import { NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { members } from '@wix/members';
import { cookies } from 'next/headers';
import { WIX_SESSION_COOKIE_NAME } from '@/src/constants/constants';

console.log('Debug - /api/auth/me route module loaded');

export async function GET() {
    console.log('Debug - /api/auth/me GET handler started');

    try {
        // First check if we have a valid session cookie
        const cookieStore = cookies();
        const wixSessionCookie = cookieStore.get(WIX_SESSION_COOKIE_NAME);

        console.log('Debug - Cookie check:', {
            exists: !!wixSessionCookie,
            name: wixSessionCookie?.name
        });

        if (!wixSessionCookie?.value) {
            console.log('Debug - No session cookie found');
            return NextResponse.json({ user: null });
        }

        // Try to parse the cookie value
        let tokens;
        try {
            tokens = JSON.parse(wixSessionCookie.value);
            console.log('Debug - Parsed tokens:', {
                hasAccessToken: !!tokens?.accessToken?.value,
                accessTokenExpiry: tokens?.accessToken?.expiresAt,
                hasRefreshToken: !!tokens?.refreshToken?.value,
            });
        } catch (parseError) {
            console.error('Debug - Failed to parse session cookie:', parseError);
            return NextResponse.json({ user: null });
        }

        // Now get the Wix client
        const wixClient = getServerWixClient();
        console.log('Debug - Got wixClient');

        // Check if logged in
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