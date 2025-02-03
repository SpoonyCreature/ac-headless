import { getServerWixClient } from "@/src/app/serverWixClient";
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { members } from "@wix/members";
import { google } from 'googleapis';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

// Helper function to get or create Wix member
async function getOrCreateWixMember(email: string, profile: { name: string; picture: string }) {
    console.log('Debug - getOrCreateWixMember: Start', { email });
    const wixAdminClient = createClient({
        auth: ApiKeyStrategy({
            apiKey: process.env.WIX_API_KEY_ADMIN!,
            siteId: process.env.WIX_SITE_ID!,
        }),
        modules: { members },
    });

    console.log('Debug - getOrCreateWixMember: Querying members with email', email);
    const { items } = await wixAdminClient.members
        .queryMembers()
        .eq("loginEmail", email)
        .find();

    let member;
    if (items.length === 0) {
        console.log('Debug - getOrCreateWixMember: No member found, creating new member for email', email);
        member = await wixAdminClient.members.createMember({
            member: {
                loginEmail: email,
                status: members.Status.APPROVED,
                privacyStatus: members.PrivacyStatusStatus.PRIVATE,
                profile: {
                    nickname: profile.name,
                    photo: {
                        url: profile.picture,
                        height: 200,
                        width: 200
                    }
                }
            },
        });
        console.log('Debug - getOrCreateWixMember: New member created', { memberId: member._id });
    } else {
        member = items[0];
        console.log('Debug - getOrCreateWixMember: Member found', { memberId: member._id });
    }
    return member;
}

export async function GET(request: NextRequest) {
    console.log('Debug - GET /api/auth/google/callback: Start');

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        console.error('Google OAuth error:', error);
        return NextResponse.redirect(new URL('/?error=' + encodeURIComponent('Google authentication failed'), request.url));
    }

    if (!code) {
        console.log('Debug - GET /api/auth/google/callback: No code provided');
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        // Step 1: Get Google user info
        console.log('Debug - GET /api/auth/google/callback: Step 1 - Getting Google user info');
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
        );

        const { tokens: googleTokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleTokens);

        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: googleUser } = await oauth2.userinfo.get();
        console.log('Debug - GET /api/auth/google/callback: Step 1 - Google user info retrieved', { googleUserEmail: googleUser.email });


        if (!googleUser?.email) {
            console.log('Debug - GET /api/auth/google/callback: Step 1 - No email provided by Google');
            return NextResponse.redirect(new URL('/?error=' + encodeURIComponent('No email provided by Google'), request.url));
        }

        // Step 2: Get or create Wix member
        console.log('Debug - GET /api/auth/google/callback: Step 2 - Getting or creating Wix member for email', googleUser.email);
        const member = await getOrCreateWixMember(googleUser.email, {
            name: googleUser.name || '',
            picture: googleUser.picture || ''
        });
        console.log('Debug - GET /api/auth/google/callback: Step 2 - Wix member retrieved or created', { wixMemberId: member._id });


        // Step 3: Get member tokens
        console.log('Debug - GET /api/auth/google/callback: Step 3 - Getting member tokens for memberId', member._id);
        const memberTokens = await getServerWixClient().auth.getMemberTokensForExternalLogin(
            member._id,
            process.env.WIX_API_KEY_ADMIN!
        );
        console.log('Debug - GET /api/auth/google/callback: Step 3 - Member tokens retrieved');


        // Create response with redirect
        console.log('Debug - GET /api/auth/google/callback: Creating redirect response to /');
        const response = NextResponse.redirect(new URL('/', request.url));

        // Set the cookie with updated settings - session only, no maxAge
        console.log('Debug - GET /api/auth/google/callback: Setting wixSession cookie');
        response.cookies.set("wixSession", JSON.stringify(memberTokens), {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: true
        });
        console.log('Debug - GET /api/auth/google/callback: wixSession cookie set successfully');


        return response;
    } catch (error) {
        console.error('Error in Google callback:', error);
        console.error('Error details:', error.response?.data || error.message);
        return NextResponse.redirect(new URL('/?error=' + encodeURIComponent('Authentication failed'), request.url));
    }
}