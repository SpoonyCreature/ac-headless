import { createClient, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';
import { members } from '@wix/members';
import { comments } from '@wix/comments';
import Cookies from 'js-cookie';
import { WIX_SESSION_COOKIE_NAME } from '../constants/constants';
import { refreshTokensIfNeeded } from '../lib/auth';

export const getWixClient = async () => {
    // Try to refresh tokens if needed
    await refreshTokensIfNeeded();

    // Get the current session cookie
    const sessionCookie = Cookies.get(WIX_SESSION_COOKIE_NAME);
    const tokens = sessionCookie ? JSON.parse(sessionCookie) : undefined;

    return createClient({
        modules: {
            items,
            members,
            comments
        },
        auth: OAuthStrategy({
            clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
            tokens
        })
    });
}; 
