import { NextRequest, NextResponse } from 'next/server';
import { getSpecificVerses } from '@/src/lib/bible';

// Helper function to normalize verse references
function normalizeReference(ref: string): string {
    // Handle numbered books by ensuring consistent spacing
    // e.g., "1Timothy 2:3" -> "1 Timothy 2:3"
    return ref.replace(/(\d)([A-Za-z])/, '$1 $2');
}

export async function POST(request: NextRequest) {
    try {
        const { otVerses, ntVerses } = await request.json();

        // Normalize verse references
        const normalizedOtVerses = otVerses ? otVerses.split(';').map(normalizeReference).join(';') : '';
        const normalizedNtVerses = ntVerses ? ntVerses.split(';').map(normalizeReference).join(';') : '';

        console.log('normalizedOtVerses', normalizedOtVerses);
        console.log('normalizedNtVerses', normalizedNtVerses);

        // Fetch original text verses
        const [otResults, ntResults] = await Promise.all([
            normalizedOtVerses ? getSpecificVerses(normalizedOtVerses, "codex") : Promise.resolve([]),
            normalizedNtVerses ? getSpecificVerses(normalizedNtVerses, "textusreceptus") : Promise.resolve([])
        ]);

        // Extract the reference from the original request
        const otRefs = otVerses ? otVerses.split(';') : [];
        const ntRefs = ntVerses ? ntVerses.split(';') : [];

        // Combine and format results using original English references
        const verses = [
            ...otResults.map((v, i) => ({
                reference: otRefs[i],
                text: v.text,
                language: 'hebrew' as const
            })),
            ...ntResults.map((v, i) => ({
                reference: ntRefs[i],
                text: v.text,
                language: 'greek' as const
            }))
        ];

        return NextResponse.json({ verses });
    } catch (error) {
        console.error('Error fetching original text:', error);
        return NextResponse.json(
            { error: 'Failed to fetch original text' },
            { status: 500 }
        );
    }
} 
