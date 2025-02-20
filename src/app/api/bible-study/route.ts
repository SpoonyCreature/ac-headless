import { NextRequest, NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { BIBLE_STRUCTURE } from '@/src/lib/bible';
import { UserContext } from '@/src/types/userContext';

// Helper to extract book and chapter from verse reference
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

// Create a new Bible study record (not used to update the Bible study subsequently)
export async function POST(request: NextRequest) {
    const wixClient = getServerWixClient();

    // Check authentication
    if (!wixClient.auth.loggedIn()) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const { member } = await wixClient.members.getCurrentMember();

        if (!member?._id) {
            return NextResponse.json(
                { error: 'Member not found' },
                { status: 404 }
            );
        }

        const { query, translation, verses, crossReferences, explanation } = await request.json();

        // Create the Bible study
        const study = await wixClient.items.insert('biblestudy', {
            query,
            translation,
            verses: verses.map((v: any) => ({
                reference: v.reference,
                verses: v.verses
            })),
            crossReferences: crossReferences || [],
            explanation,
            public: false,
            notes: [],
            comments: [],
            commentaries: []
        });

        // Update user context with Bible coverage
        const { items: contextItems } = await wixClient.items
            .query('userContext')
            .eq('_owner', member._id)
            .find();

        if (contextItems.length > 0) {
            const userContext = contextItems[0] as UserContext;
            const updatedContext = {
                ...userContext,
                lastActivity: new Date().toISOString(),
                lastStudyDate: new Date().toISOString()
            } as UserContext;

            // Extract unique books and chapters from verses
            const studiedVerses = new Set<string>();
            const coverageUpdates = new Map<string, Set<number>>();

            verses.forEach((v: any) => {
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
                const bookIndex = existingCoverage.findIndex(b => b.book === book);
                if (bookIndex === -1) {
                    updatedCoverage.push({
                        book,
                        chaptersRead: Array.from(chapters),
                        lastStudied: new Date().toISOString()
                    });
                } else {
                    const existingChapters = new Set(existingCoverage[bookIndex].chaptersRead);
                    chapters.forEach(ch => existingChapters.add(ch));
                    updatedCoverage[bookIndex] = {
                        ...existingCoverage[bookIndex],
                        chaptersRead: Array.from(existingChapters),
                        lastStudied: new Date().toISOString()
                    };
                }
            });

            updatedContext.bibleCoverage = updatedCoverage;

            // Update study streak
            const lastStudyDate = new Date(userContext.lastStudyDate || 0);
            const today = new Date();
            const daysSinceLastStudy = Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceLastStudy <= 1) {
                updatedContext.studyStreak = (userContext.studyStreak || 0) + 1;
            } else {
                updatedContext.studyStreak = 1;
            }

            // Update user context with the full object
            await wixClient.items.update('userContext', {
                ...updatedContext,
                _id: userContext._id // Ensure we don't change the ID
            });
        }

        return NextResponse.json({
            studyId: study._id
        });
    } catch (error) {
        console.error('Error creating Bible study:', error);
        return NextResponse.json(
            { error: 'Failed to create Bible study' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const wixClient = getServerWixClient();
    const url = new URL(request.url);

    // Get query parameters
    const isPublic = url.searchParams.get('public') === 'true';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    try {
        let query = wixClient.items.query('biblestudy');

        // Apply filters
        if (isPublic) {
            // Get public studies
            query = query.eq('public', true);
        } else if (wixClient.auth.loggedIn()) {
            // Get user's studies
            const { member } = await wixClient.members.getCurrentMember();
            if (!member) {
                throw new Error('User not found');
            }
            query = query.eq('_owner', member._id);
        } else {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Add search if provided
        if (search) {
            query = query.contains('query', search);
        }

        // Add pagination
        query = query
            .descending('_createdDate')
            .skip((page - 1) * limit)
            .limit(limit);

        // Execute query
        const { items } = await query.find();

        return NextResponse.json({
            studies: items,
            page,
            limit,
            hasMore: items.length === limit
        });
    } catch (error) {
        console.error('Error fetching Bible studies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Bible studies' },
            { status: 500 }
        );
    }
} 
