import { completion } from './ai';
import type { Message } from './ai/types';
import type { BibleStudy } from '@/src/types/bible';
import type { UserContextNote } from '@/src/types/userContext';
import type { ChatMessage } from '@/src/types/chat';
import { getServerWixClient } from '@/src/app/serverWixClient';

// Prompt templates for different note types
const NOTE_PROMPTS = {
    BIBLE_STUDY_COMPLETION: {
        systemPrompt: `
            You are a theological mentor and spiritual guide, tasked with making brief, insightful observations about a user's Bible study activity.
            The intention is, like a Doctor, you'll be able to refer to the notes in the future to understand the user's spiritual condition and journey.
            Your notes should be:
            1. Concise 
            2. Observational but not judgmental
            3. Written in third person
            4. Include relevant theological or thematic observations when possible
            5. Contain a sufficient amount of detail to maximize usefulness, but be cognizant of space and storage
            `,
        userPrompt: `Based on this Bible study query and content, write a brief note about what was studied:
            Query: {query}
            Verses: {verses}
            Translation: {translation}`
    },
    CHAT_COMPLETION: {
        systemPrompt: `
            You are a theological mentor and spiritual guide, tasked with making brief, insightful observations about a user's chat interactions.
            Like a doctor's notes, you'll help build a record of the user's spiritual journey and theological interests.
            Your notes should:
            1. Be concise but informative
            2. Focus on the theological/spiritual themes discussed
            3. Note any particular areas of interest or concern
            4. Highlight patterns in their questions and understanding across the conversation
            5. Be written in third person, professional tone
            6. Avoid judgments or prescriptive statements
            7. Summarize the key theological topics and progression of thought
            `,
        userPrompt: `Based on this chat conversation thread, write a brief note summarizing the theological discussion:
            Chat Thread:
            {chatThread}
            Sources Referenced: {sources}`
    }
} as const;

// Helper to format verses for the prompt
function formatVersesForPrompt(verses: BibleStudy['verses']): string {
    return verses.map(v => `${v.reference}: ${v.verses.map(verse => verse.text).join(' ')}`).join('\n');
}

// Helper to format sources for the chat prompt
function formatSourcesForPrompt(sources: any[] = []): string {
    return sources.map(s => `${s.title}: ${s.text}`).join('\n');
}

// Helper to format chat thread for the prompt
function formatChatThreadForPrompt(messages: { role: string; text: string }[]): string {
    return messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n\n');
}

// Helper to determine whether we should generate a note for the chat
export function shouldGenerateNoteForChat(threadLength: number): boolean {
    // Only generate notes on every 4 messages
    return threadLength % 4 === 0 && threadLength > 0;
}

/**
 * Generates a note about a completed Bible study
 */
export async function generateBibleStudyNote(study: BibleStudy): Promise<void> {
    const messages: Message[] = [
        {
            role: 'system',
            content: NOTE_PROMPTS.BIBLE_STUDY_COMPLETION.systemPrompt
        },
        {
            role: 'user',
            content: NOTE_PROMPTS.BIBLE_STUDY_COMPLETION.userPrompt
                .replace('{query}', study.query)
                .replace('{verses}', formatVersesForPrompt(study.verses))
                .replace('{translation}', study.translation)
        }
    ];

    const content = await completion(messages);
    const note = {
        timestamp: new Date().toISOString(),
        content: content as string,
        type: 'llm',
        tags: ['bible-study']
    };

    await addNoteToUserContext(note);
}

/**
 * Generates a note about a chat interaction thread
 * This should be called at specific intervals during the chat
 */
export async function generateChatNote(
    chatThread: { role: string; text: string }[],
    sources: any[] = []
): Promise<void> {
    const messages: Message[] = [
        {
            role: 'system',
            content: NOTE_PROMPTS.CHAT_COMPLETION.systemPrompt
        },
        {
            role: 'user',
            content: NOTE_PROMPTS.CHAT_COMPLETION.userPrompt
                .replace('{chatThread}', formatChatThreadForPrompt(chatThread))
                .replace('{sources}', formatSourcesForPrompt(sources))
        }
    ];

    const content = await completion(messages);
    const note = {
        timestamp: new Date().toISOString(),
        content: content as string,
        type: 'llm',
        tags: ['chat-interaction']
    };

    await addNoteToUserContext(note);
}

/**
 * Updates the user context with a new note
 */
export async function addNoteToUserContext(note: UserContextNote): Promise<void> {
    const wixClient = getServerWixClient();

    try {
        // Get current member
        const { member } = await wixClient.members.getCurrentMember();
        if (!member?._id) {
            throw new Error('Member not found');
        }

        // Get current user context
        const { items } = await wixClient.items
            .query('userContext')
            .eq('_owner', member._id)
            .find();

        if (items.length === 0) {
            throw new Error('User context not found');
        }

        const userContext = items[0];

        // Update with new note
        await wixClient.items.update('userContext', {
            ...userContext,
            notes: [...(userContext.notes || []), note],
            lastActivity: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to add note to user context:', error);
        throw new Error('Failed to add note to user context');
    }
} 