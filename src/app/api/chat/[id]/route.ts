import { NextRequest, NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const wixClient = getServerWixClient();

    try {
        const { items } = await wixClient.items
            .query('gptthread')
            .eq('_id', params.id)
            .find();

        if (items.length === 0) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json({ chat: items[0] });
    } catch (error) {
        console.error('Error fetching chat:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 