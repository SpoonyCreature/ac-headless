import { NextRequest, NextResponse } from 'next/server';
import { completion } from '@/src/lib/openai';
import { getSpecificVerses } from '@/src/lib/bible';

interface CrossReference {
    reference: string;
    connection: string;
    theme: string;
    testament: string;
    period: string;
    narrative_order: number;
}

// Helper to parse verse references from GPT response
function parseVerseReferences(response: string): string[] {
    // Split the response into lines and filter out empty lines
    const lines = response.split('\n').filter(line => line.trim());

    // Extract verse references (ignoring section headers that start with ##)
    const references = lines
        .filter(line => !line.startsWith('##'))
        .join(' ')
        .split(';')
        .map(ref => ref.trim())
        .filter(ref => ref);

    return references;
}

export async function POST(request: NextRequest) {
    try {
        const { reference, text, translation = 'web' } = await request.json();

        if (!reference || !text) {
            return NextResponse.json(
                { error: 'Reference and text are required' },
                { status: 400 }
            );
        }

        // Step 1: Get cross references using GPT
        const crossRefPrompt = `
            <instructions>
                You will be provided with a Bible verse
                You have to provide a cross references for the provided Bible verse
                You may only provide a maximum of 8 cross reference verses - so ensure they are relevant to the verse and high impact.
            </instructions>
            <output-format>
            {{book name in english}} {{chapter}}:{verse},{verse};  // for specific verses in a chapter
                OR
                {{book name in english}} {{chapter}}:{{verse}}-{{verse}}; // for a range of verses in a chapter
                OR
                {{book name in english}} {{chapter}}:{verse},{verse}; {{book name in english}} {{chapter}}:{{verse}}-{{verse}} ... // for a combination of verses from many locations
            </output-format>
            <output-example>
            ## Example 1
                John 3:16,17; 1 John 3:16-19,22
                
                ## Example 2
                Genesis 1:1-3; Leviticus 6:1,5,7; Exodus 15:18,21-22
            </output-example>
        `;

        const crossRefResponse = await completion([
            { role: 'system', content: crossRefPrompt },
            {
                role: 'user', content: `<verse-reference>${reference}</verse-reference>
            <verse-text>${text}</verse-text>`
            }
        ], {
            temperature: 0.7
        });

        if (!crossRefResponse) {
            throw new Error('No response from GPT for cross references');
        }

        // Parse the response into structured data
        const lines = crossRefResponse.split('\n').filter(line => line.trim());
        const crossReferences: CrossReference[] = [];
        let currentRef: Partial<CrossReference> = {};

        for (const line of lines) {
            if (line.startsWith('## Cross Reference')) {
                if (Object.keys(currentRef).length > 0 && currentRef.reference) {
                    crossReferences.push(currentRef as CrossReference);
                }
                currentRef = {};
            } else if (line.includes(':')) {
                const [key, value] = line.split(':').map(s => s.trim());
                if (key === 'Reference') {
                    currentRef.reference = value;
                } else if (key === 'Connection') {
                    currentRef.connection = value;
                } else if (key === 'Theme') {
                    currentRef.theme = value;
                } else if (key === 'Testament') {
                    currentRef.testament = value;
                } else if (key === 'Period') {
                    currentRef.period = value;
                } else if (key === 'Order') {
                    currentRef.narrative_order = parseInt(value);
                }
            }
        }
        if (Object.keys(currentRef).length > 0 && currentRef.reference) {
            crossReferences.push(currentRef as CrossReference);
        }

        // Step 2: Fetch the actual verse texts
        const verseRefs = crossReferences.map(ref => ref.reference);
        const verses = await getSpecificVerses(verseRefs.join('; '), translation);

        // Step 3: Combine the verse texts with the metadata
        const enrichedCrossReferences = verses.map((verse, index) => ({
            ...verse,
            ...crossReferences[index],
            year: Math.floor(crossReferences[index].narrative_order * 40) - 2000 // Rough conversion to biblical years
        }));

        return NextResponse.json({
            crossReferences: enrichedCrossReferences,
            translation
        });
    } catch (error) {
        console.error('Error generating cross references:', error);
        return NextResponse.json(
            { error: 'Failed to generate cross references' },
            { status: 500 }
        );
    }
} 
