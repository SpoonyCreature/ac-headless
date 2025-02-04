'use client';

import { useEffect, useState } from 'react';
import { Bot, Book, Save, Globe, Lock, Edit2, Check, X } from 'lucide-react';
import { BibleStudyResults } from '@/src/components/BibleStudyResults';
import { useRouter } from 'next/navigation';

interface BibleStudy {
    _id: string;
    query: string;
    translation: string;
    verses: Array<{
        reference: string;
        text: string;
    }>;
    crossReferences: Array<{
        reference: string;
        text: string;
    }>;
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
            setStudy(data.study);

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

    const handleSave = async () => {
        if (!study || !editedStudy) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/bible-study/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedStudy),
            });

            if (!response.ok) {
                throw new Error('Failed to update Bible study');
            }

            const data = await response.json();
            setStudy(data.study);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update Bible study');
        } finally {
            setIsLoading(false);
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

                    {/* Owner Controls */}
                    {isOwner && (
                        <div className="mb-8 flex justify-center gap-4">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                    >
                                        <Check className="w-4 h-4" />
                                        Save Changes
                                    </button>
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

                    {/* Study Content */}
                    <BibleStudyResults
                        results={{
                            verses: study.verses.map(v => {
                                const [bookChapter, verse] = v.reference.split(':');
                                const [book, chapter] = bookChapter.split(' ');
                                return {
                                    bookName: book,
                                    chapter,
                                    verse,
                                    text: v.text
                                };
                            }),
                            crossReferences: study.crossReferences?.map(v => {
                                const [bookChapter, verse] = v.reference.split(':');
                                const [book, chapter] = bookChapter.split(' ');
                                return {
                                    bookName: book,
                                    chapter,
                                    verse,
                                    text: v.text
                                };
                            }),
                            explanation: study.explanation
                        }}
                    />

                    {/* Notes Section - TODO */}
                    {/* Comments Section - TODO */}
                </div>
            </div>
        </main>
    );
} 