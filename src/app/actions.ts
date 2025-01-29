'use server';

import { redirect } from 'next/navigation';
import { getServerWixClient } from './serverWixClient';

export async function login() {
    const wixClient = getServerWixClient();
    const { url } = await wixClient.auth.generateOAuthURL('/', {
        provider: 'google',
        mode: 'signUp'
    });
    redirect(url);
}

export async function logout() {
    const wixClient = getServerWixClient();
    await wixClient.auth.logout();
    redirect('/');
} 