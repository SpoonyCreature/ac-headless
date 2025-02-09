'use client';

import { useEffect, useState } from 'react';
import { Bot, Book, Globe, Lock, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { EnhancedBibleStudy } from '@/src/components/EnhancedBibleStudy';
import { BibleStudy } from '@/src/types/bible';

export default function BibleStudyDetailPage({
    params
}: {
    params: { id: string }
}) {
    const [study, setStudy] = useState<BibleStudy | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudy = async () => {
            try {
                const response = await fetch(`/api/bible-study/${params.id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch study');
                }
                const data = await response.json();

                // Check if we need to fetch original verses
                if (!data.study.originalVerses || data.study.originalVerses.length === 0) {
                    // List of NT books including numbered books
                    const ntBooks = [
                        'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
                        '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
                        'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
                        '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
                        'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
                        'Jude', 'Revelation'
                    ];

                    // Separate OT and NT verses
                    const otVerses = data.study.verses
                        .filter((v: any) => {
                            const ref = v.reference;
                            return !ntBooks.some(book => ref.startsWith(book));
                        })
                        .map((v: any) => v.reference)
                        .join(';');

                    const ntVerses = data.study.verses
                        .filter((v: any) => {
                            const ref = v.reference;
                            return ntBooks.some(book => ref.startsWith(book));
                        })
                        .map((v: any) => v.reference)
                        .join(';');

                    if (otVerses || ntVerses) {
                        const originalResponse = await fetch('/api/bible-study/original-text', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                otVerses,
                                ntVerses
                            }),
                        });

                        if (originalResponse.ok) {
                            const originalData = await originalResponse.json();
                            data.study.originalVerses = originalData.verses;

                            // Update the study in the database
                            await fetch(`/api/bible-study/${params.id}`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    originalVerses: originalData.verses
                                }),
                            });
                        }
                    }
                }

                // Process verses to add parsed reference parts and match original verses
                const processedStudy: BibleStudy = {
                    ...data.study,
                    verses: data.study.verses.map((v: any) => {
                        const [bookChapter, verse] = v.reference.split(':');
                        const lastSpaceIndex = bookChapter.lastIndexOf(' ');

                        // Find matching original verse
                        const originalVerse = data.study.originalVerses?.find(
                            (ov: any) => ov.reference === v.reference
                        );

                        return {
                            ...v,
                            verse: verse,
                            originalText: originalVerse
                        };
                    }),
                    crossReferences: Array.isArray(data.study.crossReferences) ? data.study.crossReferences : []
                };

                setStudy(processedStudy);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load study');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudy();
    }, [params.id]);

    const handleGenerateCommentary = async (verseRef: string, previousCommentaries: any[]) => {
        try {
            const verse = study?.verses.find(v => `${v.reference}` === verseRef);
            if (!verse || !verse.verses) throw new Error('Verse not found or invalid');

            // Find cross references for this verse if they exist
            const verseCrossRefs = study?.crossReferences?.filter(ref =>
                ref.sourceReference === verseRef
            ).map(ref => ({
                reference: ref.reference,
                text: ref.text,
                originalText: ref.originalText
            }));

            // Map previous commentaries to include original text
            const mappedPreviousCommentaries = previousCommentaries.map(pc => {
                const verse = study?.verses.find(v => `${v.reference}` === pc.verseRef);
                return {
                    ...pc,
                    originalText: verse?.originalText
                };
            });

            const response = await fetch('/api/bible-study/commentary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verseRef,
                    verseText: verse.verses.map(v => v.text).join(' '),
                    originalText: verse.originalText?.verses?.map(v => v.text).join(' '),
                    previousCommentaries: mappedPreviousCommentaries,
                    crossReferences: verseCrossRefs,
                    originalQuery: study?.query,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate commentary');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error generating commentary:', error);
            throw error;
        }
    };

    const handleSaveCommentary = async (verseRef: string, commentary: any) => {
        try {
            if (!study) return;

            // Update the study with new commentary
            const updatedCommentaries = [
                ...(study.commentaries || []).filter(c => c.verseRef !== verseRef),
                {
                    verseRef,
                    commentary,
                    timestamp: Date.now()
                }
            ];

            // Update local state
            setStudy({
                ...study,
                commentaries: updatedCommentaries
            });

            // Persist to backend
            const updateResponse = await fetch(`/api/bible-study/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    commentaries: updatedCommentaries
                }),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to persist commentary');
            }
        } catch (error) {
            console.error('Error saving commentary:', error);
            throw error;
        }
    };

    const handleGenerateCrossReferenceMap = async (verse: any) => {
        try {
            if (!verse?.verses) throw new Error('Invalid verse data');

            const response = await fetch('/api/bible-study/cross-references', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reference: verse.reference,
                    text: verse.verses.map(v => v.text).join(' '),
                    translation: study?.translation
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate cross references');
            }

            const { crossReferences } = await response.json();

            // Update the study with new cross references
            if (study) {
                const updatedCrossReferences = [
                    ...(study.crossReferences || []).filter(ref => ref.sourceReference !== `${verse.reference}`),
                    ...crossReferences
                ];

                // Update local state
                setStudy({
                    ...study,
                    crossReferences: updatedCrossReferences
                });

                // Persist to backend
                const updateResponse = await fetch(`/api/bible-study/${params.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        crossReferences: updatedCrossReferences
                    }),
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to persist cross references');
                }
            }
        } catch (error) {
            console.error('Error generating cross references:', error);
            throw error;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat flex items-center justify-center">
                <div className="text-center">
                    <Bot className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <div className="text-muted-foreground">Loading study...</div>
                </div>
            </div>
        );
    }

    if (error || !study) {
        return (
            <div className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat flex items-center justify-center">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                    {error || 'Failed to load study'}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <div className="mb-8">
                    <Link
                        href="/ai/bible-study"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Bible Studies
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <Book className="w-16 h-16 text-primary mx-auto mb-6" />
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <h1 className="font-serif text-4xl md:text-5xl">Bible Study</h1>
                        {study.public ? (
                            <Globe className="w-5 h-5 text-muted-foreground" />
                        ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                    </div>
                    <p className="text-xl text-muted-foreground font-serif leading-relaxed mb-4">
                        {study.query}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Translation: {study.translation.toUpperCase()}
                    </p>
                </div>

                {/* Enhanced Bible Study Component */}
                <div className="max-w-4xl mx-auto">
                    <EnhancedBibleStudy
                        verses={study.verses}
                        crossReferences={study.crossReferences}
                        explanation={study.explanation}
                        query={study.query}
                        onGenerateCommentary={handleGenerateCommentary}
                        onGenerateCrossReferenceMap={handleGenerateCrossReferenceMap}
                        onSaveCommentary={handleSaveCommentary}
                        initialCommentaries={study.commentaries || []}
                    />
                </div>
            </div>
        </div>
    );
} 