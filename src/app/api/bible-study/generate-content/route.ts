import { NextRequest, NextResponse } from 'next/server';
import { completion } from '@/src/lib/ai';

export async function POST(request: NextRequest) {
    try {
        const { verses, originalVerses, query } = await request.json();

        // Prepare the prompt
        const prompt = `
            You are a knowledgeable and engaging Bible study leader. 
            You have authority to speak on the topic of the Bible.
            You are a theolgian worthy of being on the Reformation Wall - in leuge with John Calvin and others.
            You are Reformed, a Calvinist, and a presuppositional apologist.
            Your role is to present Bible studies in a natural, conversational way that flows well when read aloud. 
            Focus on clear verbal transitions and natural speech patterns. 
        `;

        // Generate content using the AI provider
        const content = await completion([
            { role: 'system', content: prompt },
            {
                role: 'user',
                content: `Please present a conversational Bible study on the topic: "${query}"\n\nI'd like you to explore these verses:\n${verses.map((v: any) => `${v.reference}: ${v.verses.map((verse: any) => verse.text).join(' ')}`).join('\n')}\n\nWe also have these original language insights to incorporate:\n${originalVerses?.map((v: any) => `${v.reference} (${v.language}): ${v.verses.map((verse: any) => verse.text).join(' ')}`).join('\n')}\n\nPresent this as if you're speaking to a group. Start with a warm welcome and context, then naturally flow through the verses and their meanings. Include thoughtful pauses for reflection, and weave in the original language insights where they add depth to our understanding.\n\nRemember to:\n- Speak naturally, as if having a conversation\n- Use transition phrases like "Now, let's consider..." or "This reminds me of..."\n- If there is something interesting in the original languages, take time to highlight it - but if the English is fine, don't bother.\n- Present numbers as words\n- Include moments for reflection\n- Close with some thoughts for personal application\n\nPlease begin as if you're starting the study session.`
            }
        ], {
            temperature: 0.7,
            modelName: 'gemini-2.0-flash-001'
        });

        // Process the content to ensure proper paragraph breaks while preserving markdown
        const processedContent = String(content)
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')  // Replace 3+ newlines with double newlines
            .replace(/([^.\n])\n([A-Z])/g, '$1\n\n$2')  // Add double newline before new sentences that start with capital letters
            .replace(/([.!?])\s*\n/g, '$1\n\n')  // Add double newline after sentences
            .trim();

        // For speech content, strip out markdown
        const speechContent = processedContent
            .replace(/[_*`]/g, '')  // Remove markdown symbols
            .replace(/\n\n/g, ' \n')  // Convert double newlines to single with space
            .replace(/\s+/g, ' ')  // Normalize whitespace
            .trim();

        // Return both versions
        return NextResponse.json({
            content: processedContent,
            speechContent
        });
    } catch (error) {
        console.error('Error generating Bible study content:', error);
        return NextResponse.json(
            { error: 'Failed to generate Bible study content' },
            { status: 500 }
        );
    }
} 
