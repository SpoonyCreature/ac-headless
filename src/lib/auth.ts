import { createClient, OAuthStrategy, Tokens } from "@wix/sdk";
import { WIX_SESSION_COOKIE_NAME } from "../constants/constants";
import Cookies from "js-cookie";

export async function refreshTokensIfNeeded(): Promise<Tokens | null> {
    const sessionCookie = Cookies.get(WIX_SESSION_COOKIE_NAME);
    if (!sessionCookie) return null;

    try {
        const tokens: Tokens = JSON.parse(sessionCookie);
        const now = Date.now() / 1000; // Convert to seconds

        // Check if access token is expired or will expire in the next 5 minutes
        if (!tokens.accessToken?.expiresAt || tokens.accessToken.expiresAt - now < 300) {
            const wixClient = createClient({
                auth: OAuthStrategy({
                    clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
                    tokens
                })
            });

            const newTokens = await wixClient.auth.generateVisitorTokens(tokens);

            // Update the cookie with new tokens
            Cookies.set(WIX_SESSION_COOKIE_NAME, JSON.stringify(newTokens), {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            return newTokens;
        }

        return tokens;
    } catch (error) {
        console.error('Error refreshing tokens:', error);
        return null;
    }
} 
