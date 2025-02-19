import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

// Create a singleton OAuth client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const redirectPath = searchParams.get('redirect') || '/';

        // Generate the url that will be used for the consent dialog.
        const authorizeUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'openid'
            ],
            prompt: 'consent',
            state: redirectPath // Pass the redirect path in the state parameter
        });

        // Redirect directly to Google's auth page
        return NextResponse.redirect(authorizeUrl);
    } catch (error) {
        console.error('Error initiating Google login:', error);
        return NextResponse.json({ error: 'Failed to initiate Google login' }, { status: 500 });
    }
} 