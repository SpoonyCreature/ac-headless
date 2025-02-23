import { NextRequest, NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { completion, JsonSchemaFormat } from '@/src/lib/ai';
import { getSpecificVerses } from '@/src/lib/bible';
import type { BibleVerse, CrossReference } from '@/src/types/bible';

interface SearchRequest {
    query: string;
    translation?: string;
}

interface SearchResponse {
    verse_sections: Array<{
        title: string;
        verses: Array<string>;
    }>;
}

const searchSchema: JsonSchemaFormat = {
    type: "json_schema",
    json_schema: {
        name: "bible_search",
        schema: {
            type: "object",
            properties: {
                verse_sections: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            title: {
                                type: "string",
                                description: "A descriptive title for this section of verses"
                            },
                            verses: {
                                type: "array",
                                items: {
                                    type: "string",
                                    description: "Bible verse reference. Format: {{book name in english}} {{chapter}}:{{verse}}-{{verse}} or {{book name in english}} {{chapter}}:{verse},{verse}"
                                }
                            }
                        },
                        required: ["title", "verses"],
                        additionalProperties: false
                    }
                }
            },
            required: ["verse_sections"],
            additionalProperties: false
        },
        strict: true
    }
};

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
    const wixClient = getServerWixClient();

    try {
        const { query, translation = 'web' }: SearchRequest = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: 'No query provided' },
                { status: 400 }
            );
        }

        // Step 1: Use GPT to find relevant verses with JSON schema
        const searchPrompt = `
            <identity>
            You are an expert Bible scholar.
            Your goal is to curate a list of verses that are relevant to a particular saerch query, that will be able to faciliate a deep Bible study.
            You will attempt to provide verses that not only superficually relate to a topic, but that can unlock amazing insights that might not be immediately obvious.
            </identity>
            <instructions>
            Try and provide a fairly comprehensive list of verses that are relevant to the search query, which can be used to faciliate a Bible study as well (approx. 10-30 verses)
            Always retrun verses in the requested format ONLY, even if the user asks for something non-sensical - make it work / fit
            If a user asks for a chapter / chapters, split return chapter verse combinations that make sense for seperate study (i.e., never retrun a full chapter as is, but split it into nice sections for sensible study)
            Try keep the verses in sequence per book / chapter combination.
            Verse groups must always be within the same chapter (e.g. Genesis 3:16-31; Genesis 4:1-15)
                <notes>
                Note: Remember the book name is Psalm, not Psalms
                Note: Strictly only include canonical books in the output.. no Romanist books.
                Note: if the user asks for "{{book name in english}} {{chapter}}", return something like "{{book name in english}} {{chapter}}:{{verse}}-{{verse}}"
                </notes>
            </instructions>
            <output-format>
            {{book name in english}} {{chapter}}:{verse},{verse};  // for specific verses in a chapter
            OR
            {{book name in english}} {{chapter}}:{{verse}}-{{verse}} // for a range of verses in a chapter
            </output-format>
            <output-example>
            ## Example 1
            John 3:16,17
            
            ## Example 2
            Genesis 1:1-3
            </output-example>
                    `;

        const searchResponse = await completion([
            { role: 'system', content: searchPrompt },
            { role: 'user', content: `Please provide the verses in the specified format for the following query: ${query}` }
        ], {
            temperature: 0.7,
            response_format: searchSchema,
            modelName: 'gemini-2.0-flash-001'
        }) as SearchResponse;

        console.log('Search response:', JSON.stringify(searchResponse, null, 2));

        if (!searchResponse?.verse_sections) {
            throw new Error('Invalid response format from GPT');
        }

        // Step 2: Get the actual verses from the Bible API
        const allVerseRefs = searchResponse.verse_sections.flatMap(section => section.verses);
        const verses = await Promise.all(
            allVerseRefs.map(async (ref) => {
                const verses = await getSpecificVerses(ref, translation);
                const formatted = formatVerses(verses);
                return {
                    reference: ref,
                    verses: formatted.verses
                } as BibleVerse;
            })
        );

        // Step 3: Generate an explanation/overview
        const explanationPrompt = `
            Based on the following Bible verses, provide a brief overview that could be used as a Bible study introduction.
            Keep the explanation to 2-3 sentences.
            Focus on the main theological themes and how they connect.
            Verses: ${verses.map(v => `${v.reference}`).join('; ')}
        `;

        const explanation = await completion([
            { role: 'system', content: explanationPrompt },
            { role: 'user', content: 'Please provide a Bible study overview.' }
        ]) as string;

        return NextResponse.json({
            verses,
            sections: searchResponse.verse_sections,
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
