import { NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { members } from '@wix/members';
import { cookies } from 'next/headers';
import { WIX_SESSION_COOKIE_NAME } from '@/src/constants/constants';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;


export async function GET() {

    try {
        // First check if we have a valid session cookie
        const cookieStore = cookies();
        const wixSessionCookie = cookieStore.get(WIX_SESSION_COOKIE_NAME);

        if (!wixSessionCookie?.value) {
            const response = NextResponse.json({ user: null });
            response.headers.set('Cache-Control', 'no-store, must-revalidate');
            return response;
        }

        // Try to parse the cookie value
        let tokens;
        try {
            tokens = JSON.parse(wixSessionCookie.value);
            const now = Date.now() / 1000; // Convert to seconds
        } catch (parseError) {
            console.error('Debug - Failed to parse session cookie:', parseError);
            const response = NextResponse.json({ user: null });
            response.headers.set('Cache-Control', 'no-store, must-revalidate');
            return response;
        }

        // Now get the Wix client
        const wixClient = getServerWixClient();

        // Check if logged in
        const isLoggedIn = wixClient.auth.loggedIn();

        if (!isLoggedIn) {
            const response = NextResponse.json({ user: null });
            response.headers.set('Cache-Control', 'no-store, must-revalidate');
            return response;
        }

        // Get member info
        try {
            const { member } = await wixClient.members.getCurrentMember({
                fieldsets: [members.Set.FULL]
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