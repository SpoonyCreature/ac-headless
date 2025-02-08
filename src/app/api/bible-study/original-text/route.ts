import { NextRequest, NextResponse } from 'next/server';
import { getSpecificVerses } from '@/src/lib/bible';

interface OriginalVerse {
    reference: string;
    text: string;
    language: 'hebrew' | 'greek';
}

interface VerseSection {
    title: string;
    verses: OriginalVerse[];
}

// Helper function to normalize verse references
function normalizeReference(ref: string): string {
    // Handle numbered books by ensuring consistent spacing
    // e.g., "1Timothy 2:3" -> "1 Timothy 2:3"
    return ref.replace(/(\d)([A-Za-z])/, '$1 $2');
}

// Helper function to format verses with verse numbers
function formatVerses(verses: Array<{ reference: string; text: string }>) {
    return {
        verses: verses.map(v => ({
            verse: v.reference.split(':')[1],
            text: v.text
        }))
    };
}

export async function POST(request: NextRequest) {
    try {
        const { otVerses, ntVerses } = await request.json();

        // Normalize verse references
        const normalizedOtVerses = otVerses ? otVerses.split(';').map(normalizeReference).join(';') : '';
        const normalizedNtVerses = ntVerses ? ntVerses.split(';').map(normalizeReference).join(';') : '';

        // Create sections for OT and NT verses
        let otVersesPopulated: any[] = [];
        let ntVersesPopulated: any[] = [];

        if (normalizedOtVerses) {
            const otRefs = normalizedOtVerses.split(';').filter(ref => ref.trim());

            otVersesPopulated = await Promise.all(
                otRefs.map(async (ref) => {
                    const verses = await getSpecificVerses(ref, "codex");
                    const formatted = formatVerses(verses);
                    return {
                        reference: ref,
                        verses: formatted.verses,
                        language: 'hebrew' as const
                    };
                })
            );
        }

        if (normalizedNtVerses) {
            const ntRefs = normalizedNtVerses.split(';').filter(ref => ref.trim());

            ntVersesPopulated = await Promise.all(
                ntRefs.map(async (ref) => {
                    const verses = await getSpecificVerses(ref, "textusreceptus");
                    const formatted = formatVerses(verses);
                    return {
                        reference: ref,
                        verses: formatted.verses,
                        language: 'greek' as const
                    };
                })
            );
        }

        const verses = [...otVersesPopulated, ...ntVersesPopulated];

        return NextResponse.json({ verses });
    } catch (error) {
        console.error('Error fetching original text:', error);
        return NextResponse.json(
            { error: 'Failed to fetch original text' },
            { status: 500 }
        );
    }
} 
