import { OAuthStrategy, createClient } from "@wix/sdk";
import { NextRequest, NextResponse } from "next/server";
import { WIX_SESSION_COOKIE_NAME } from "@/src/constants/constants";

export async function middleware(request: NextRequest) {
    // Skip RSC requests
    if (request.nextUrl.searchParams.has('_rsc')) {
        console.log('Debug - Middleware: Skipping RSC request:', request.nextUrl.pathname);
        return NextResponse.next();
    }

    // Check for existing session
    const wixSessionCookie = request.cookies.get(WIX_SESSION_COOKIE_NAME);
    if (wixSessionCookie?.value) {
        try {
            // Validate the token structure and expiration
            const tokens = JSON.parse(wixSessionCookie.value);
            const now = Date.now() / 1000; // Convert to seconds

            // Check if token exists and is not expired or about to expire (5 min buffer)
            if (tokens?.accessToken?.value && tokens.accessToken.expiresAt > now + 300) {
                return NextResponse.next();
            }

            // Token exists but is expired or about to expire, try to refresh
            if (tokens?.refreshToken?.value) {
                console.log('Debug - Middleware: Refreshing expired tokens');
                const wixClient = createClient({
                    auth: OAuthStrategy({
                        clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
                        tokens
                    })
                });

                const newTokens = await wixClient.auth.generateVisitorTokens(tokens);
                const response = NextResponse.next();

                response.cookies.set(
                    WIX_SESSION_COOKIE_NAME,
                    JSON.stringify(newTokens),
                    {
                        path: '/',
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        httpOnly: true
                    }
                );

                return response;
            }
        } catch (error) {
            console.error('Debug - Middleware: Invalid or expired session token:', error);
        }
    }

    // No valid session or refresh failed, generate new visitor tokens
    console.log("Debug - Middleware: No valid session found, generating visitor tokens");
    const myWixClient = createClient({
        auth: OAuthStrategy({ clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID! }),
    });

    try {
        const visitorTokens = await myWixClient.auth.generateVisitorTokens();
        console.log("Debug - Middleware: Generated visitor tokens");

        const response = NextResponse.next();
        response.cookies.set(
            WIX_SESSION_COOKIE_NAME,
            JSON.stringify(visitorTokens),
            {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                httpOnly: true
            }
        );

        return response;
    } catch (error) {
        console.error('Debug - Middleware: Error generating visitor tokens:', error);
        return NextResponse.redirect(new URL('/?error=failed_to_generate_tokens', request.url));
    }
}

export const config = {
    matcher: [
        // Match all paths except static assets
        '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
}; 