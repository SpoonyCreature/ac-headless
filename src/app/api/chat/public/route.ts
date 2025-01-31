import { NextRequest, NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';

export async function GET(request: NextRequest) {
    const wixClient = getServerWixClient();

    try {
        const { items } = await wixClient.items
            .query('gptthread')
            .eq('public', true)
            .find();

        return NextResponse.json({ chats: items });
    } catch (error) {
        console.error('Error fetching public chats:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 