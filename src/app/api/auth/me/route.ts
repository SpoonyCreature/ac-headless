import { NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { members } from '@wix/members';
import { cookies } from 'next/headers';
import { WIX_SESSION_COOKIE_NAME } from '@/src/constants/constants';

export async function GET() {
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
            return NextResponse.json({ user: null });
        }

        const { member } = await wixClient.members.getCurrentMember({
            fieldsets: [members.Set.FULL]
        });

        // Debug: Log member info
        console.log('Debug - Member found:', {
            memberId: member?._id,
            hasProfile: !!member?.profile
        });

        return NextResponse.json({ user: member });
    } catch (error) {
        // Debug: Log detailed error
        console.error('Error checking auth status:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ user: null });
    }
} 