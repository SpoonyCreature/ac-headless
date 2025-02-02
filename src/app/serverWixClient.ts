import { OAuthStrategy, createClient } from "@wix/sdk";
import { cookies } from "next/headers";
import { WIX_SESSION_COOKIE_NAME } from "./../constants/constants";
import { members } from "@wix/members";
import { items } from "@wix/data";
import { comments } from "@wix/comments";

export function getServerWixClient() {
    const cookieStore = cookies();
    const wixSessionCookie = cookieStore.get(WIX_SESSION_COOKIE_NAME);

    // Debug: Log initial cookie state
    console.log('Debug - ServerWixClient: Initial cookie state:', {
        hasWixSession: !!wixSessionCookie,
        cookieName: wixSessionCookie?.name,
    });

    let tokens;
    try {
        if (wixSessionCookie?.value) {
            tokens = JSON.parse(wixSessionCookie.value);
            // Check token validity
            const now = Date.now() / 1000; // Convert to seconds
            const isAccessTokenValid = tokens?.accessToken?.value &&
                tokens?.accessToken?.expiresAt &&
                tokens.accessToken.expiresAt > now;

            console.log('Debug - ServerWixClient: Token validation:', {
                hasAccessToken: !!tokens?.accessToken?.value,
                accessTokenExpiry: tokens?.accessToken?.expiresAt,
                currentTime: now,
                isAccessTokenValid,
                hasRefreshToken: !!tokens?.refreshToken?.value,
            });

            // If access token is expired but we have a refresh token, we should probably refresh
            if (!isAccessTokenValid && tokens?.refreshToken?.value) {
                console.log('Debug - ServerWixClient: Access token expired but has refresh token');
            }
        }
    } catch (error) {
        console.error('Debug - ServerWixClient: Error parsing session cookie:', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        tokens = undefined;
    }

    // Create the client
    const client = createClient({
        auth: OAuthStrategy({
            clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
            tokens,
        }),
        modules: {
            members,
            items,
            comments,
        },
    });

    // Test the client's auth state
    const isLoggedIn = client.auth.loggedIn();
    console.log('Debug - ServerWixClient: Client created:', {
        hasTokens: !!tokens,
        isLoggedIn,
    });

    return client;
}