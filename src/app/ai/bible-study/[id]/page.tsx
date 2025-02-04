'use client';

import { useEffect, useState } from 'react';
import { Bot, Book, Save, Globe, Lock, Edit2, Check, X, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { BibleStudyDetailView } from '@/src/components/BibleStudyDetailView';
import { useRouter } from 'next/navigation';

interface BibleVerse {
    bookName: string;  // Required
    chapter: string;   // Required
    verse: string;     // Required
    text: string;
    reference: string;
    originalText?: {
        reference: string;
        text: string;
        language: 'hebrew' | 'greek';
    };
    commentary?: string[];
    aiInsights?: string[];
    crossReferenceMap?: {
        reference: string;
        connection: string;
    }[];
}

interface BibleStudy {
    _id: string;
    query: string;
    translation: string;
    verses: Array<BibleVerse>;  // Using the BibleVerse interface
    crossReferences: Array<BibleVerse>;  // Using the same interface for consistency
    explanation: string;
    public: boolean;
    notes: string[];
    comments: string[];
    _owner: string;
    _createdDate: string;
}

export default function BibleStudyViewPage({ params }: { params: { id: string } }) {
    const [study, setStudy] = useState<BibleStudy | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedStudy, setEditedStudy] = useState<Partial<BibleStudy>>({});
    const router = useRouter();

    useEffect(() => {
        fetchStudy();
    }, [params.id]);

    const fetchStudy = async () => {
        try {
            const response = await fetch(`/api/bible-study/${params.id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Bible study not found');
                }
                throw new Error('Failed to fetch Bible study');
            }

            const data = await response.json();

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
                        bookName: bookChapter.slice(0, lastSpaceIndex),
                        chapter: bookChapter.slice(lastSpaceIndex + 1),
                        verse: verse,
                        originalText: originalVerse
                    };
                }),
                crossReferences: data.study.crossReferences?.map((v: any) => {
                    const [bookChapter, verse] = v.reference.split(':');
                    const lastSpaceIndex = bookChapter.lastIndexOf(' ');
                    return {
                        ...v,
                        bookName: bookChapter.slice(0, lastSpaceIndex),
                        chapter: bookChapter.slice(lastSpaceIndex + 1),
                        verse: verse
                    };
                }) || []
            };

            setStudy(processedStudy);

            // Check if current user is the owner
            const authResponse = await fetch('/api/auth/me');
            const authData = await authResponse.json();
            if (authData.user && authData.user.member) {
                setIsOwner(authData.user.member._id === data.study._owner);
            } else {
                setIsOwner(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateCommentary = async (verse: any) => {
        if (!study) return;

        try {
            const response = await fetch(`/api/bible-study/${study._id}/commentary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reference: `${verse.bookName} ${verse.chapter}:${verse.verse}`,
                    text: verse.text
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate commentary');
            }

            const data = await response.json();
            // Refresh the study to get the new commentary
            await fetchStudy();
        } catch (error) {
            console.error('Error generating commentary:', error);
        }
    };

    const handleGenerateInsights = async (verse: any) => {
        if (!study) return;

        try {
            const response = await fetch(`/api/bible-study/${study._id}/insights`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reference: `${verse.bookName} ${verse.chapter}:${verse.verse}`,
                    text: verse.text
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate insights');
            }

            const data = await response.json();
            // Refresh the study to get the new insights
            await fetchStudy();
        } catch (error) {
            console.error('Error generating insights:', error);
        }
    };

    const handleGenerateCrossReferenceMap = async (verse: any) => {
        if (!study) return;

        try {
            const response = await fetch(`/api/bible-study/${study._id}/cross-reference-map`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reference: `${verse.bookName} ${verse.chapter}:${verse.verse}`,
                    text: verse.text
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate cross reference map');
            }

            const data = await response.json();
            // Refresh the study to get the new cross reference map
            await fetchStudy();
        } catch (error) {
            console.error('Error generating cross reference map:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center py-12">
                        <Bot className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Loading Bible study...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !study) {
        return (
            <div className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                            {error || 'Bible study not found'}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
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

                    {/* Controls */}
                    {isOwner && (
                        <div className="mb-8 flex justify-center gap-4">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditedStudy({});
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Study
                                </button>
                            )}
                        </div>
                    )}

                    {/* Bible Study Detail View */}
                    <BibleStudyDetailView
                        study={study}
                        onGenerateCommentary={handleGenerateCommentary}
                        onGenerateInsights={handleGenerateInsights}
                        onGenerateCrossReferenceMap={handleGenerateCrossReferenceMap}
                    />
                </div>
            </div>
        </main>
    );
} 