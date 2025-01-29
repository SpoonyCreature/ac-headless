import { NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { members } from '@wix/members';

export async function GET() {
    try {
        const wixClient = getServerWixClient();

        if (!wixClient.auth.loggedIn()) {
            return NextResponse.json({ user: null });
        }

        const { member } = await wixClient.members.getCurrentMember({
            fieldsets: [members.Set.FULL]
        });

        return NextResponse.json({ user: member });
    } catch (error) {
        console.error('Error checking auth status:', error);
        return NextResponse.json({ user: null });
    }
} 