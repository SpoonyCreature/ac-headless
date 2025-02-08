import { NextResponse } from 'next/server';
import { completion, JsonSchemaFormat } from '@/src/lib/ai';

// Define the commentary response type
interface CommentaryResponse {
    sections: Array<{
        title: string;
        content: Array<{
            type: 'text' | 'greek' | 'hebrew' | 'emphasis' | 'reference';
            text: string;
        }>;
    }>;
}

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
                                    required: ["type", "text"]
                                }
                            }
                        },
                        required: ["title", "content"]
                    }
                }
            },
            required: ["sections"]
        }
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
            Your response must be incredibly concise - aim for 1-3 sentences per section maximum.

            Given the provided context - bring out the most significant things that you see, and the most amazing connections.
            Focus on depth rather than breadth. Quality over quantity.
            
            Remember:
            - Each section must be incredibly concise (1-3 sentences)
            - Every word must carry significant meaning
            - Focus on the most profound insights only`;

        const commentary = await completion([
            {
                role: "system",
                content: `You are a biblical scholar and commentator with expertise in biblical languages, theology, and hermeneutics. Provide clear, accurate, and insightful commentary that helps readers understand the depth and significance of Scripture.
                    Your responses must use these content types precisely:
                    - 'text' for normal commentary and connecting words
                    - 'greek' for Greek terms (always include both transliteration and original script)
                    - 'hebrew' for Hebrew terms (always include both transliteration and original script)
                    - 'emphasis' for key theological commentary points and crucial observations (this is also a "text" format - and is used for bolding the text down the line)
                    - 'reference' for ALL Bible verse references (this is also a "text" format - and is used for linking the reference down the line)

                    Format each content piece separately, like these examples:

                    EXAMPLE 1 - Greek terms with commentary:
                    {
                        "type": "text",
                        "text": "The word love here comes from "
                    },
                    {
                        "type": "greek",
                        "text": "agapē (ἀγάπη)"
                    },
                    {
                        "type": "text",
                        "text": ", which emphasizes divine, unconditional love."
                    }

                    EXAMPLE 2 - Theological emphasis with Hebrew:
                    {
                        "type": "text",
                        "text": "The term "
                    },
                    {
                        "type": "hebrew",
                        "text": "shalom (שָׁלוֹם)"
                    },
                    {
                        "type": "text",
                        "text": " reveals that "
                    },
                    {
                        "type": "emphasis",
                        "text": "true peace encompasses complete wholeness with God"
                    },
                    {
                        "type": "text",
                        "text": "."
                    }

                    EXAMPLE 3 - Theological principle with reference:
                    {
                        "type": "text",
                        "text": "In "
                    },
                    {
                        "type": "reference",
                        "text": "Romans 3:21-26"
                    },
                    {
                        "type": "text",
                        "text": ", we discover that "
                    },
                    {
                        "type": "emphasis",
                        "text": "God's righteousness is revealed both in His justice and His mercy"
                    },
                    {
                        "type": "text",
                        "text": "."
                    }

                    EXAMPLE 4 - Structural observation:
                    {
                        "type": "text",
                        "text": "The chiastic structure of this passage reveals that "
                    },
                    {
                        "type": "emphasis",
                        "text": "worship and obedience are inseparably linked in biblical faith"
                    },
                    {
                        "type": "text",
                        "text": "."
                    }

                    EXAMPLE 5 - Critical insight from language study:
                    {
                        "type": "text",
                        "text": "The use of "
                    },
                    {
                        "type": "greek",
                        "text": "teleios (τέλειος)"
                    },
                    {
                        "type": "text",
                        "text": " here shows that "
                    },
                    {
                        "type": "emphasis",
                        "text": "Christian maturity is about reaching God's intended purpose, not perfection"
                    },
                    {
                        "type": "text",
                        "text": "."
                    }

                    EXAMPLE 6 - Doctrinal connection:
                    {
                        "type": "text",
                        "text": "Through the parallel use of "
                    },
                    {
                        "type": "hebrew",
                        "text": "hesed (חֶסֶד)"
                    },
                    {
                        "type": "text",
                        "text": " and "
                    },
                    {
                        "type": "greek",
                        "text": "charis (χάρις)"
                    },
                    {
                        "type": "text",
                        "text": ", we see that "
                    },
                    {
                        "type": "emphasis",
                        "text": "God's covenant faithfulness in the Old Testament finds its fullest expression in New Testament grace"
                    },
                    {
                        "type": "text",
                        "text": "."
                    }

                    EXAMPLE 7 - Profound spiritual truth:
                    {
                        "type": "text",
                        "text": "The progression from "
                    },
                    {
                        "type": "reference",
                        "text": "2 Corinthians 3:18"
                    },
                    {
                        "type": "text",
                        "text": " to "
                    },
                    {
                        "type": "reference",
                        "text": "4:6"
                    },
                    {
                        "type": "text",
                        "text": " reveals that "
                    },
                    {
                        "type": "emphasis",
                        "text": "transformation into Christ's image happens as we behold God's glory"
                    },
                    {
                        "type": "text",
                        "text": "."
                    }


                    Use emphasis ONLY for:
                    - Key theological principles
                    - Critical interpretive insights
                    - Profound spiritual truths
                    - Major doctrinal points
                    - Significant structural observations

                    NEVER use emphasis for:
                    - Simple translations
                    - Basic definitions
                    - Regular commentary
                    - Historical facts

                    NB NB NB Keep responses incredibly concise - each section should be 1-3 sentences maximum NB NB NB
                    If a response if too long, an elf will suffer eternally in the nether.
                    Break content into small, logical chunks and never combine different types in one piece.
                    Focus on depth over breadth, bringing out only the most profound insights.`
            },
            {
                role: "user",
                content: prompt
            }
        ], {
            temperature: 0.7,
            response_format: commentarySchema
        }) as CommentaryResponse;

        // Add detailed logging
        console.log('Commentary API Response:', {
            input: { verseRef, verseText, originalQuery },
            gptResponse: JSON.stringify(commentary),
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
