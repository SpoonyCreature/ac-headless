import { OAuthStrategy, createClient } from "@wix/sdk";
import { NextRequest, NextResponse } from "next/server";
import { WIX_SESSION_COOKIE_NAME } from "@/src/constants/constants";

export async function middleware(request: NextRequest) {
    // Log auth-related requests
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
        console.log('Debug - Middleware: Auth request detected:', {
            path: request.nextUrl.pathname,
            method: request.method,
            hasWixSession: request.cookies.has('wixSession'),
            cookieValue: request.cookies.get('wixSession')?.value ? '[REDACTED]' : undefined,
            headers: Object.fromEntries(request.headers.entries())
        });
    }

    if (
        !request.cookies.get(WIX_SESSION_COOKIE_NAME) ||
        request.cookies.get(WIX_SESSION_COOKIE_NAME)?.value === ""
    ) {
        console.log("Debug - Middleware: No session found, generating visitor tokens");
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

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all paths except static assets
        '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
}; 