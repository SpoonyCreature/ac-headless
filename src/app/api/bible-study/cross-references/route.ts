import { NextRequest, NextResponse } from 'next/server';
import { completion, JsonSchemaFormat } from '@/src/lib/openai';
import { getSpecificVerses } from '@/src/lib/bible';
import { CrossReference } from '@/src/types/bible';

interface CrossReferenceRequest {
    bookName: string;
    chapter: string;
    verse: string;
    text: string;
    translation?: string;
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
        const { bookName, chapter, verse, text, translation = 'web' }: CrossReferenceRequest = await request.json();

        if (!bookName || !chapter || !verse || !text) {
            return NextResponse.json(
                { error: 'Book name, chapter, verse, and text are required' },
                { status: 400 }
            );
        }

        const sourceReference = `${bookName} ${chapter}:${verse}`;

        // Step 1: Get cross references using GPT with JSON schema
        const crossRefPrompt = `
            Analyze the provided Bible verse and generate up to 8 relevant cross references.
            For each cross reference, provide:
            1. The exact verse reference (can include verse ranges, e.g. "Colossians 1:16-19" or "Genesis 1:1,3")
            2. How it connects to the original verse
            3. The historical period it belongs to
            
            Ensure the references are highly relevant and impactful.
            
            Original verse: ${sourceReference}
            Text: ${text}
        `;

        const crossRefResponse = await completion([
            { role: 'system', content: crossRefPrompt },
            { role: 'user', content: 'Please provide the cross references in the specified format.' }
        ], {
            temperature: 0.7,
            response_format: crossReferencesSchema
        });

        // Add detailed logging
        console.log('Cross References API Response:', {
            input: { bookName, chapter, verse, text },
            gptResponse: crossRefResponse,
            timestamp: new Date().toISOString()
        });

        if (!crossRefResponse?.cross_references || !Array.isArray(crossRefResponse.cross_references)) {
            throw new Error('Invalid response format from GPT');
        }

        // Create the cross references array
        const crossReferences: CrossReference[] = crossRefResponse.cross_references.map((ref) => ({
            reference: ref.reference,
            connection: ref.connection,
            period: ref.period,
            text: '', // The text will be displayed when needed
            sourceReference
        }));

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
