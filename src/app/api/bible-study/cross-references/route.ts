import { NextRequest, NextResponse } from 'next/server';
import { completion, JsonSchemaFormat } from '@/src/lib/ai';
import { getSpecificVerses } from '@/src/lib/bible';
import { CrossReference } from '@/src/types/bible';

interface CrossReferenceRequest {
    reference: string;
    text: string;
    translation?: string;
}

interface CrossReferenceResponse {
    cross_references: Array<{
        reference: string;
        connection: string;
        historical_period: string;
    }>;
}

// Define the JSON schema for cross references
const crossReferencesSchema: JsonSchemaFormat = {
    type: "json_schema",
    json_schema: {
        name: "cross_references",
        schema: {
            type: "object",
            properties: {
                cross_references: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            reference: {
                                type: "string",
                                description: "The Bible verse reference. Can include verse ranges. Format: {{book name in english}} {{chapter}}:{{verse}}-{{verse}} or {{book name in english}} {{chapter}}:{verse},{verse}, e.g. 'Colossians 1:16-19' or multiple verses 'Genesis 1:1,3'"
                            },
                            connection: {
                                type: "string",
                                description: "How this verse connects to the original verse in words"
                            },
                            period: {
                                type: "string",
                                enum: [
                                    "Creation",
                                    "Patriarchal",
                                    "Egyptian Bondage",
                                    "Exodus and Wilderness",
                                    "Conquest of Canaan",
                                    "Judges",
                                    "United Kingdom",
                                    "Divided Kingdom",
                                    "Exile",
                                    "Post-Exilic",
                                    "Inter-Testamental",
                                    "Life of Christ",
                                    "Early Church",
                                    "Apostolic"
                                ],
                                description: "The historical period of the verse"
                            },
                        },
                        required: ["reference", "connection", "period"],
                        additionalProperties: false
                    },
                }
            },
            required: ["cross_references"],
            additionalProperties: false
        },
        strict: true
    }
};

export async function POST(request: NextRequest) {
    try {
        const { reference, text, translation = 'web' }: CrossReferenceRequest = await request.json();

        if (!reference || !text) {
            return NextResponse.json(
                { error: 'Reference and text are required' },
                { status: 400 }
            );
        }

        const sourceReference = reference;

        // Step 1: Get cross references using GPT with JSON schema
        const crossRefPrompt = `
            Analyze the provided Bible verse and generate relevant list of cross references for the user to explore.
            You can try to be quite comprehensive, but don't include every verse in the bible lol.
            For each cross reference, provide:
            1. The exact verse reference (can include verse ranges, e.g. "Colossians 1:16-19" or "Genesis 1:1,3")
            2. How it connects to the original verse
            3. The historical period it belongs to
            
            Ensure the references are highly relevant and impactful so that it will bring out maximal insights
            
            Original verse: ${sourceReference}
            Text: ${text}
        `;

        const crossRefResponse = await completion([
            { role: 'system', content: crossRefPrompt },
            { role: 'user', content: 'Please provide the cross references in the specified format.' }
        ], {
            temperature: 0.7,
            response_format: crossReferencesSchema
        }) as CrossReferenceResponse;

        if (!crossRefResponse?.cross_references || !Array.isArray(crossRefResponse.cross_references)) {
            throw new Error('Invalid response format from GPT');
        }

        // Map the response to match the CrossReference type
        const crossReferences = await Promise.all(
            crossRefResponse.cross_references.map(async (ref) => {
                const verses = await getSpecificVerses(ref.reference, translation);
                const verseText = verses.map(v => v.text).join(' ');
                return {
                    reference: ref.reference,
                    connection: ref.connection,
                    period: ref.historical_period,
                    text: verseText,
                    sourceReference,
                } as CrossReference;
            })
        );

        return NextResponse.json({
            crossReferences,
            translation
        });
    } catch (error) {
        console.error('Error generating cross references:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate cross references' },
            { status: 500 }
        );
    }
} 
