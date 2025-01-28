import { OAuthStrategy, createClient } from "@wix/sdk";
import { NextRequest, NextResponse } from "next/server";
import { WIX_SESSION_COOKIE_NAME } from "@/src/constants/constants";

export async function middleware(request: NextRequest) {
    console.log("Middleware running on path:", request.nextUrl.pathname);
    console.log("All cookies:", request.cookies.getAll());
    console.log("WixSession cookie:", request.cookies.get(WIX_SESSION_COOKIE_NAME));

    if (
        !request.cookies.get(WIX_SESSION_COOKIE_NAME) ||
        request.cookies.get(WIX_SESSION_COOKIE_NAME)?.value === ""
    ) {
        console.log("No session found, generating visitor tokens");
        const myWixClient = createClient({
            auth: OAuthStrategy({ clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID! }),
        });

        try {
            const visitorTokens = await myWixClient.auth.generateVisitorTokens();
            console.log("Generated visitor tokens");

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
            console.error('Error generating visitor tokens:', error);
            return NextResponse.redirect(new URL('/?error=failed_to_generate_tokens', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 