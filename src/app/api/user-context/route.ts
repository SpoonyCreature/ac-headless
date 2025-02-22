import { NextRequest, NextResponse } from 'next/server';
import { getServerWixClient } from '@/src/app/serverWixClient';
import { BIBLE_STRUCTURE } from '@/src/lib/bible';
import { UserContext } from '@/src/types/userContext';

// Helper to calculate Bible coverage
function calculateBibleCoverage(bibleCoverage: any[]) {
    const totalChapters = Object.values(BIBLE_STRUCTURE).reduce((sum, book) => sum + book.chapters, 0);
    const readChapters = bibleCoverage.reduce((sum, book) => sum + book.chaptersRead.length, 0);
    return (readChapters / totalChapters) * 100;
}

export async function GET(request: NextRequest) {
    const wixClient = getServerWixClient();

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

        // Get or create user context
        const { items } = await wixClient.items
            .query('userContext')
            .eq('_owner', member._id)
            .find();

        let userContext: UserContext;

        if (items.length === 0) {
            // Create new user context
            const newContext = await wixClient.items.insert('userContext', {
                _owner: member._id,
                notes: [],
                bibleCoverage: [],
                lastActivity: new Date().toISOString(),
                studyStreak: 0,
                lastStudyDate: undefined,
                favoriteTopics: []
            } as Partial<UserContext>);
            userContext = newContext as UserContext;
        } else {
            userContext = items[0] as UserContext;
        }

        // Calculate overall Bible coverage
        const coverage = calculateBibleCoverage(userContext.bibleCoverage || []);

        return NextResponse.json({
            userContext,
            coverage
        });
    } catch (error) {
        console.error('Error fetching user context:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user context' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const wixClient = getServerWixClient();

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

        const { note, bibleCoverage, studyStreak, lastStudyDate } = await request.json();

        // Get existing user context
        const { items } = await wixClient.items
            .query('userContext')
            .eq('_owner', member._id)
            .find();

        if (items.length === 0) {
            return NextResponse.json(
                { error: 'User context not found' },
                { status: 404 }
            );
        }

        const userContext = items[0] as UserContext;
        const updatedContext = {
            ...userContext,
            lastActivity: new Date().toISOString()
        };

        // Update notes if provided
        if (note) {
            updatedContext.notes = [...(userContext.notes || []), {
                ...note,
                timestamp: new Date().toISOString()
            }];
        }

        // Update Bible coverage if provided
        if (bibleCoverage) {
            const existingCoverage = userContext.bibleCoverage || [];
            const bookIndex = existingCoverage.findIndex(b => b.book === bibleCoverage.book);

            if (bookIndex === -1) {
                updatedContext.bibleCoverage = [
                    ...existingCoverage,
                    {
                        ...bibleCoverage,
                        lastStudied: new Date().toISOString()
                    }
                ];
            } else {
                const updatedCoverage = [...existingCoverage];
                updatedCoverage[bookIndex] = {
                    ...updatedCoverage[bookIndex],
                    chaptersRead: Array.from(new Set([
                        ...updatedCoverage[bookIndex].chaptersRead,
                        ...bibleCoverage.chaptersRead
                    ])),
                    lastStudied: new Date().toISOString()
                };
                updatedContext.bibleCoverage = updatedCoverage;
            }
        }

        // Update other fields if provided
        if (studyStreak !== undefined) updatedContext.studyStreak = studyStreak;
        if (lastStudyDate) updatedContext.lastStudyDate = lastStudyDate;

        // Update user context with the full object
        const result = await wixClient.items.update('userContext', {
            ...updatedContext,
            _id: userContext._id // Ensure we don't change the ID
        });

        // Calculate overall Bible coverage
        const coverage = calculateBibleCoverage(result.bibleCoverage || []);

        return NextResponse.json({
            userContext: result,
            coverage
        });
    } catch (error) {
        console.error('Error updating user context:', error);
        return NextResponse.json(
            { error: 'Failed to update user context' },
            { status: 500 }
        );
    }
} 
