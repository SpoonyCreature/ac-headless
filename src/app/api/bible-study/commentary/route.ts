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
            prompt += `\n\n**Original Language:** ${originalText.language === 'hebrew' ? 'Hebrew' : 'Greek'}\n"${originalText.text}"`;
        }

        prompt += ` and provide a structured commentary.`;

        // Add cross references if available
        if (crossReferences && crossReferences.length > 0) {
            prompt += `\n\n**Relevant cross-references:**\n`;
            crossReferences.forEach(ref => {
                prompt += `\n${ref.reference}: "${ref.text}"`;
                if (ref.originalText) {
                    prompt += `\n${ref.originalText.language === 'hebrew' ? 'Hebrew' : 'Greek'}: "${ref.originalText.text}"`;
                }
            });
        }

        // Add previous commentaries context with original language
        if (previousCommentaries && previousCommentaries.length > 0) {
            prompt += `\n\n**Build upon these previous commentaries and their original language texts:**\n`;
            previousCommentaries.forEach(({ verseRef, commentary, originalText }) => {
                prompt += `\n${verseRef}:\n${commentary.markdown}`;
                if (originalText) {
                    prompt += `\n${originalText.language === 'hebrew' ? 'Hebrew' : 'Greek'}: "${originalText.text}"`;
                }
            });
        }

        // Add original study query context
        if (originalQuery) {
            prompt += `\n\n**This is part of a study on**: "${originalQuery}, and make sure that the commentary is specifically tailored to this query".`;
        }


        const commentary = await completion([
            {
                role: "system",
                content: `You are a biblical scholar and commentator with expertise in biblical languages, theology, and hermeneutics. 
            
            Your commentary should be:
            - Precise and concise... no more than 2 - 3 sentences per section. If for every word used, en elf suffers in the Nether - and we want to minisie suffering.
            - Rich in theological insight
            - Grounded in original languages
            - Connected to the broader biblical narrative
            - Drive by bullet points and lists
            - NEGATIVE PROMPT: Avoid listing cross-references - as that is available for the user to see. Only provide commentary on how the cross references illumine the verse.
            
            Format your response in markdown with these elements:
            - Use ## for main sections
            - Use ### for subsections when needed
            - Use **bold** for key theological terms and crucial observations
            - Use *italics* for Greek/Hebrew terms (include both transliteration and original script)
            - Use > blockquotes for quotations of verses / prior commentaries
            - Use - bullet points for lists and applications
            - Keep paragraphs short and focused
            - Use line breaks between sections
            
            Provide your insights in markdown format with the following sections:
            <output-format>
                ## {{section title}}
                A concise explanation of the verse's immediate meaning and context.

                ## Word Studies & Language // this is the only required section
                ONLY the key terms in the original language with their significance.
                Include the word if a pastor would mention this from the pulpit and it would prove insightful for the congregation.

                .... add more sections here ....
            </output-format>

            Remember:
            - Each section should be incredibly concise (2-3 sentences max)
            - Focus on depth over breadth
            - Every word should carry significant meaning
            - Use markdown features to enhance readability:
            - *italics* for original language terms
            - **bold** for key theological concepts
            - > blockquotes for Scripture references
            - - bullet points for lists
            - ### for subsections where needed
            `
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
