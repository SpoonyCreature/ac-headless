import { BIBLE_STRUCTURE } from './bible';
import type { UserContext } from '@/src/types/userContext';
import type { BibleVerse } from '@/src/types/bible';
import { getServerWixClient } from '@/src/app/serverWixClient';

/**
 * Helper to extract book and chapter from verse reference
 */
function extractBookAndChapter(reference: string): { book: string; chapter: number } | null {
    // Handle numbered books (e.g., "1 John", "2 Peter")
    const match = reference.match(/^(\d\s+)?([a-zA-Z]+)\s+(\d+):/);
    if (!match) return null;

    const bookNumber = match[1]?.trim() || '';
    const bookName = match[2];
    const chapter = parseInt(match[3]);

    const fullBookName = bookNumber ? `${bookNumber} ${bookName}` : bookName;

    // Verify it's a valid book
    if (BIBLE_STRUCTURE[fullBookName as keyof typeof BIBLE_STRUCTURE]) {
        return {
            book: fullBookName,
            chapter
        };
    }
    return null;
}

/**
 * Updates the user context with Bible coverage information from a set of verses
 */
export async function updateBibleCoverage(
    userContext: UserContext,
    verses: BibleVerse[]
): Promise<void> {
    // Extract unique books and chapters from verses
    const studiedVerses = new Set<string>();
    const coverageUpdates = new Map<string, Set<number>>();

    verses.forEach((v) => {
        const extracted = extractBookAndChapter(v.reference);
        if (extracted && !studiedVerses.has(`${extracted.book} ${extracted.chapter}`)) {
            studiedVerses.add(`${extracted.book} ${extracted.chapter}`);

            if (!coverageUpdates.has(extracted.book)) {
                coverageUpdates.set(extracted.book, new Set<number>());
            }
            coverageUpdates.get(extracted.book)?.add(extracted.chapter);
        }
    });

    // Update Bible coverage
    const existingCoverage = userContext.bibleCoverage || [];
    const updatedCoverage = [...existingCoverage];

    coverageUpdates.forEach((chapters, book) => {
        const bookIndex = updatedCoverage.findIndex(b => b.book === book);
        if (bookIndex === -1) {
            updatedCoverage.push({
                book,
                chaptersRead: Array.from(chapters),
                lastStudied: new Date().toISOString()
            });
        } else {
            updatedCoverage[bookIndex] = {
                ...updatedCoverage[bookIndex],
                chaptersRead: Array.from(new Set([
                    ...updatedCoverage[bookIndex].chaptersRead,
                    ...Array.from(chapters)
                ])),
                lastStudied: new Date().toISOString()
            };
        }
    });

    // Update the user context using Wix client
    const wixClient = getServerWixClient();
    try {
        await wixClient.items.update('userContext', {
            ...userContext,
            bibleCoverage: updatedCoverage,
            lastActivity: new Date().toISOString(),
            lastStudyDate: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to update Bible coverage:', error);
        throw new Error('Failed to update Bible coverage in user context');
    }
} 
