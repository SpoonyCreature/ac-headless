import { NextResponse } from 'next/server';
import { completion, JsonSchemaFormat } from '@/src/lib/openai';

// Define the JSON schema for commentary
const commentarySchema: JsonSchemaFormat = {
    type: "json_schema",
    json_schema: {
        name: "commentary",
        schema: {
            type: "object",
            properties: {
                sections: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            title: {
                                type: "string",
                                enum: [
                                    "Immediate Context and Meaning",
                                    "Word Studies",
                                    "Cross-Reference Insights",
                                    "Theological Significance",
                                    "Practical Application"
                                ],
                                description: "The section title indicating the type of analysis"
                            },
                            content: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        type: {
                                            type: "string",
                                            enum: ["text", "greek", "hebrew", "emphasis", "reference"],
                                            description: "The type of content: normal text, original language terms, emphasized points, or Bible references"
                                        },
                                        text: {
                                            type: "string",
                                            description: "The actual content text"
                                        }
                                    },
                                    required: ["type", "text"],
                                    additionalProperties: false
                                }
                            }
                        },
                        required: ["title", "content"],
                        additionalProperties: false
                    },
                }
            },
            required: ["sections"],
            additionalProperties: false
        },
        strict: true
    }
};

export async function POST(request: Request) {
    try {
        const {
            verseRef,
            verseText,
            originalText,
            previousCommentaries,
            crossReferences,
            originalQuery
        } = await request.json();

        if (!verseRef || !verseText) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Build the prompt with context from previous commentaries
        let prompt = `Analyze ${verseRef}: "${verseText}"`;

        // Add original language text if available
        if (originalText) {
            prompt += `\n\nOriginal Language: ${originalText.language === 'hebrew' ? 'Hebrew' : 'Greek'}\n"${originalText.text}"`;
        }

        prompt += ` and provide a structured commentary.`;

        // Add original study query context
        if (originalQuery) {
            prompt += `\n\nThis is part of a study on: "${originalQuery}".`;
        }

        // Add cross references if available
        if (crossReferences && crossReferences.length > 0) {
            prompt += `\n\nRelevant cross-references:\n`;
            crossReferences.forEach(ref => {
                prompt += `\n${ref.reference}: "${ref.text}"`;
                if (ref.originalText) {
                    prompt += `\n${ref.originalText.language === 'hebrew' ? 'Hebrew' : 'Greek'}: "${ref.originalText.text}"`;
                }
            });
        }

        // Add previous commentaries context with original language
        if (previousCommentaries && previousCommentaries.length > 0) {
            prompt += `\n\nBuild upon these previous commentaries and their original language texts:\n`;
            previousCommentaries.forEach(({ verseRef, commentary, originalText }) => {
                prompt += `\n${verseRef}:\n${JSON.stringify(commentary)}`;
                if (originalText) {
                    prompt += `\n${originalText.language === 'hebrew' ? 'Hebrew' : 'Greek'}: "${originalText.text}"`;
                }
            });
        }

        prompt += `\n\nProvide your insights in a structured format.
            Keep each section focused and build upon previous commentaries without repetition.

            Given the provided context - bring out the most signficant things that you see, and the most amazing connections.
            nothing else.

            In particular, note the use of Hebrew and Greek words not just in the verse, but in the entire provided context - as sometimes there is meaning there that cannot be captured in English (e.g. the various types of "love" in the Greek).

            You may only respond, in aggregate, with 1 - 3 sentences.
            Responses must be incredibly short and to the point.
            Every additional word causes an elf to suffer in the nether.`;

        console.log('Prompt:', prompt);

        const commentary = await completion([
            {
                role: "system",
                content: "You are a biblical scholar and commentator with expertise in biblical languages, theology, and hermeneutics. Provide clear, accurate, and insightful commentary that helps readers understand the depth and significance of Scripture, always keeping in view the broader context and purpose of the study."
            },
            {
                role: "user",
                content: prompt
            }
        ], {
            temperature: 0.7,
            response_format: commentarySchema
        });

        // Add detailed logging
        console.log('Commentary API Response:', {
            input: { verseRef, verseText, originalQuery },
            gptResponse: commentary,
            timestamp: new Date().toISOString()
        });

        if (!commentary?.sections || !Array.isArray(commentary.sections)) {
            throw new Error('Invalid response format from GPT');
        }

        // Return just the commentary object directly
        return NextResponse.json(commentary);
    } catch (error) {
        console.error('Error generating commentary:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate commentary' },
            { status: 500 }
        );
    }
}
