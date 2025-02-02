import { NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { members } from '@wix/members';
import { cookies } from 'next/headers';
import { WIX_SESSION_COOKIE_NAME } from '@/src/constants/constants';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

console.log('Debug - /api/auth/me route module loaded');

export async function GET() {
    console.log('Debug - /api/auth/me GET handler started');

    try {
        // First check if we have a valid session cookie
        const cookieStore = cookies();
        const wixSessionCookie = cookieStore.get(WIX_SESSION_COOKIE_NAME);

        console.log('Debug - Cookie check:', {
            exists: !!wixSessionCookie,
            name: wixSessionCookie?.name,
            value: wixSessionCookie?.value ? '[REDACTED]' : undefined
        });

        if (!wixSessionCookie?.value) {
            console.log('Debug - No session cookie found');
            const response = NextResponse.json({ user: null });
            response.headers.set('Cache-Control', 'no-store, must-revalidate');
            return response;
        }

        // Try to parse the cookie value
        let tokens;
        try {
            tokens = JSON.parse(wixSessionCookie.value);
            const now = Date.now() / 1000; // Convert to seconds
            console.log('Debug - Parsed tokens:', {
                hasAccessToken: !!tokens?.accessToken?.value,
                accessTokenExpiry: tokens?.accessToken?.expiresAt,
                currentTime: now,
                isAccessTokenValid: tokens?.accessToken?.expiresAt > now,
                hasRefreshToken: !!tokens?.refreshToken?.value,
            });
        } catch (parseError) {
            console.error('Debug - Failed to parse session cookie:', parseError);
            const response = NextResponse.json({ user: null });
            response.headers.set('Cache-Control', 'no-store, must-revalidate');
            return response;
        }

        // Now get the Wix client
        const wixClient = getServerWixClient();
        console.log('Debug - Got wixClient');

        // Check if logged in
        const isLoggedIn = wixClient.auth.loggedIn();
        console.log('Debug - Auth check:', { isLoggedIn });

        if (!isLoggedIn) {
            console.log('Debug - Not logged in, returning null user');
            const response = NextResponse.json({ user: null });
            response.headers.set('Cache-Control', 'no-store, must-revalidate');
            return response;
        }

        // Get member info
        console.log('Debug - Getting member info');
        try {
            const { member } = await wixClient.members.getCurrentMember({
                fieldsets: [members.Set.FULL]
            });

            console.log('Debug - Got member:', {
                memberId: member?._id,
                hasProfile: !!member?.profile,
                status: member?.status,
                privacyStatus: member?.privacyStatus
            });

            const response = NextResponse.json({ user: member });
            response.headers.set('Cache-Control', 'no-store, must-revalidate');
            return response;
        } catch (memberError) {
            console.error('Debug - Error getting member:', {
                error: memberError instanceof Error ? memberError.message : 'Unknown error',
                stack: memberError instanceof Error ? memberError.stack : undefined
            });
            const response = NextResponse.json({ user: null });
            response.headers.set('Cache-Control', 'no-store, must-revalidate');
            return response;
        }
    } catch (error) {
        console.error('Debug - Error in /api/auth/me:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        const response = NextResponse.json({ user: null });
        response.headers.set('Cache-Control', 'no-store, must-revalidate');
        return response;
    }
} 