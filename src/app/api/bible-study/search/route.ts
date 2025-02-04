import { NextRequest, NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { completion } from '@/src/lib/openai';
import { getSpecificVerses } from '@/src/lib/bible';

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
    const wixClient = getServerWixClient();

    try {
        const { query, translation = 'web' } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: 'No query provided' },
                { status: 400 }
            );
        }

        // Step 1: Use GPT to find relevant verses
        const searchPrompt = `
            <instructions>
            Provide a list of bible verses that match the search query / theme / topic / question / statement / etc.
            Don't just consider simple matches against the search term, but take into account theological nuance as well.
            If the user seems to have put in a direct verse, then you can skip that verse in the output
            Try and provide a fairly comprehensive list of verses that are relevant to the search query, which can be used to faciliate a Bible study as well (approx. 10-30 verses)
            If the user asks for specific verses, chapter, honor that directly.
            Always retrun verses in the requested format ONLY, even if the user asks for something non-sensical - make it work / fit
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
            Genesis 1:1-3; Leviticus 6:1,5,7; Exodus 15:18,21-30
            </output-example>
            <query>${query}</query>
        `;

        const searchResponse = await completion([
            { role: 'system', content: searchPrompt },
            { role: 'user', content: query }
        ]);

        if (!searchResponse) {
            throw new Error('No response from GPT for verse search');
        }

        // Parse verse references from the response
        const verseRefs = parseVerseReferences(searchResponse);

        console.log('verseRefs', verseRefs);

        // Step 2: Get the actual verses from the Bible API
        const verses = await getSpecificVerses(verseRefs.join('; '), translation);

        // Step 3: If a specific verse was provided, get cross references
        let crossReferences = [];
        if (query.match(/[0-9]/) && verseRefs.length === 1) {
            const crossRefPrompt = `
                <instructions>
                    You will be provided with a Bible verse
                    You have to provide a cross references for the provided Bible verse
                    You may only provide a maximum of 8 cross reference verses - so ensure they are relevant to the verse and high impact.
                </instructions>
                <verse>${query}</verse>
            `;

            const crossRefResponse = await completion([
                { role: 'system', content: crossRefPrompt },
                { role: 'user', content: query }
            ]);

            if (crossRefResponse) {
                const crossRefVerseRefs = parseVerseReferences(crossRefResponse);
                crossReferences = await getSpecificVerses(crossRefVerseRefs.join('; '), translation);
            }
        }

        // Step 4: Generate an explanation/overview
        const explanationPrompt = `
            Based on the following Bible verses, provide a brief overview that could be used as a Bible study introduction.
            Keep the explanation to 2-3 sentences.
            Focus on the main theological themes and how they connect.
            Verses: ${verses.map(v => `${v.bookName} ${v.chapter}:${v.verse}`).join('; ')}
        `;

        const explanation = await completion([
            { role: 'system', content: explanationPrompt },
            { role: 'user', content: 'Please provide a Bible study overview.' }
        ]);

        // Return the preview results without saving
        return NextResponse.json({
            verses,
            crossReferences,
            explanation,
            translation
        });
    } catch (error) {
        console.error('Error in Bible study search:', error);
        return NextResponse.json(
            { error: 'Failed to process Bible study request' },
            { status: 500 }
        );
    }
} 
