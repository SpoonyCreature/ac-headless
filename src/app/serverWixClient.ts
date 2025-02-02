import { OAuthStrategy, createClient } from "@wix/sdk";
import { cookies } from "next/headers";
import { WIX_SESSION_COOKIE_NAME } from "./../constants/constants";
import { members } from "@wix/members";
import { items } from "@wix/data";
import { comments } from "@wix/comments";

export function getServerWixClient() {
    const cookieStore = cookies();
    const wixSessionCookie = cookieStore.get(WIX_SESSION_COOKIE_NAME);
    let visitorCookie;
    let tokens;

    // Debug: Log initial cookie state
    console.log('Debug - Initial Cookie State:', {
        hasWixSession: !!wixSessionCookie,
        wixSessionName: wixSessionCookie?.name,
    });

    if (!wixSessionCookie) {
        visitorCookie = cookieStore.get("session");
        console.log('Debug - Fallback to visitor cookie:', {
            hasVisitorCookie: !!visitorCookie,
            visitorCookieName: visitorCookie?.name,
        });
    }

    try {
        if (wixSessionCookie && wixSessionCookie.value) {
            tokens = JSON.parse(wixSessionCookie.value);
            console.log('Debug - Parsed wixSession tokens:', {
                hasAccessToken: !!tokens?.accessToken,
                hasRefreshToken: !!tokens?.refreshToken,
            });
        } else if (visitorCookie && visitorCookie.value) {
            tokens = JSON.parse(visitorCookie.value);
            console.log('Debug - Parsed visitor tokens:', {
                hasAccessToken: !!tokens?.accessToken,
                hasRefreshToken: !!tokens?.refreshToken,
            });
        }
    } catch (error) {
        console.error('Debug - Error parsing session cookie:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            cookieValue: wixSessionCookie?.value ? '[REDACTED]' : undefined,
            visitorValue: visitorCookie?.value ? '[REDACTED]' : undefined,
        });
        tokens = undefined;
    }

    // Debug: Log final token state
    console.log('Debug - Final token state:', {
        hasTokens: !!tokens,
        clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID?.substring(0, 8) + '...',
    });

    return createClient({
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
}