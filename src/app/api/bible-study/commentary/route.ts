import { NextResponse } from 'next/server';
import { completion, JsonSchemaFormat } from '@/src/lib/ai';

// Define the commentary response type
interface CommentaryResponse {
    markdown: string;
}

// Define the JSON schema for commentary
const commentarySchema: JsonSchemaFormat = {
    type: "json_schema",
    json_schema: {
        name: "commentary",
        schema: {
            type: "object",
            properties: {
                markdown: {
                    type: "string",
                    description: "The commentary in markdown format"
                }
            },
            required: ["markdown"]
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
                prompt += `\n${verseRef}:\n${commentary.markdown}`;
                if (originalText) {
                    prompt += `\n${originalText.language === 'hebrew' ? 'Hebrew' : 'Greek'}: "${originalText.text}"`;
                }
            });
        }

        prompt += `\n\nProvide your insights in markdown format with the following sections:

            ## Immediate Context
            A concise explanation of the verse's immediate meaning and context.

            ## Word Studies & Language
            Key terms in the original language with their significance.
            Really think hard here and make sure to consider if there is something worht higlighting... historically you missed this section
            Use *italics* for original language terms (include both transliteration and original script).
            Anything in the original languages not obvious in English should be mentioned and discussed (e.g. types of love in Greek, names of God in Hebrew which are all the same in English are not the same in Greek and Hebrew).
            Each word / phrases that is worth highlighting should be a seperate bullet point.

            ## Cross-Reference Analysis
            How this verse connects with other Scripture passages.
            Use > blockquotes for related verse texts.

            ## Theological Significance
            The key theological principles and doctrinal implications.
            Use **bold** for crucial theological concepts.

            ## Practical Application
            Brief, actionable insights for contemporary application.
            Use - bullet points for practical steps.

            Remember:
            - Each section should be incredibly concise (2-3 sentences max)
            - Focus on depth over breadth
            - Every word should carry significant meaning
            - Use markdown features to enhance readability:
            - *italics* for original language terms
            - **bold** for key theological concepts
            - > blockquotes for Scripture references
            - - bullet points for lists
            - ### for subsections where needed`;

        const commentary = await completion([
            {
                role: "system",
                content: `You are a biblical scholar and commentator with expertise in biblical languages, theology, and hermeneutics. 
            
            Your commentary should be:
            - Precise and concise
            - Rich in theological insight
            - Grounded in original languages
            - Connected to the broader biblical narrative
            - List driven
            
            Format your response in markdown with these elements:
            - Use ## for main sections
            - Use ### for subsections when needed
            - Use **bold** for key theological terms and crucial observations
            - Use *italics* for Greek/Hebrew terms (include both transliteration and original script)
            - Use > blockquotes for quotations of verses / prior commentaries
            - Use - bullet points for lists and applications
            - Keep paragraphs short and focused
            - Use line breaks between sections`
            },
            {
                role: "user",
                content: prompt
            }
        ], {
            temperature: 0.7,
            response_format: commentarySchema
        });

        console.log("\n\n\n");
        console.log(commentary);
        console.log("\n\n\n");

        return NextResponse.json(commentary);
    } catch (error) {
        console.error('Error generating commentary:', error);
        return NextResponse.json(
            { error: 'Failed to generate commentary' },
            { status: 500 }
        );
    }
}
