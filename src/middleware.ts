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
            // Validate the token structure
            const tokens = JSON.parse(wixSessionCookie.value);
            if (tokens?.accessToken?.value) {
                return NextResponse.next();
            }
        } catch (error) {
            console.error('Debug - Middleware: Invalid session token:', error);
        }
    }

    // No valid session, generate visitor tokens
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
                sameSite: 'lax'
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