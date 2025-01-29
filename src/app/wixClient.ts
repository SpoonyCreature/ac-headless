import { createClient } from '@wix/sdk';
import { items } from '@wix/data';
import { OAuthStrategy } from '@wix/sdk';

export const getWixClient = () => {
    return createClient({
        modules: { items },
        auth: OAuthStrategy({ clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID! })
    });
}; 
