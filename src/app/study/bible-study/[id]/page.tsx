'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, BookMarked, Globe, Lock, ChevronLeft, Share2, Plus, ArrowLeft, Link2, Twitter, Facebook, Check } from 'lucide-react';
import Link from 'next/link';
import { EnhancedBibleStudy } from '@/src/components/EnhancedBibleStudy';
import { BibleStudy } from '@/src/types/bible';
import { cn } from '@/src/lib/utils';
import { usePageTransition } from '@/src/hooks/usePageTransition';
import { formatDistanceToNow } from 'date-fns';

export default function BibleStudyDetailPage({
    params
}: {
    params: { id: string }
}) {
    const [study, setStudy] = useState<BibleStudy | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showShareTooltip, setShowShareTooltip] = useState(false);
    const [shareTooltipText, setShareTooltipText] = useState('');
    const { isTransitioning, navigateWithTransition } = usePageTransition();
    const shareMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setShowShareMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleShare = () => {
        setShowShareMenu(!showShareMenu);
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setShareTooltipText('Copied to clipboard!');
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
        setShowShareMenu(false);
    };

    const handleShareTwitter = () => {
        const text = study ? `Check out this Bible study: ${study.query || 'Untitled Study'}` : 'Check out this Bible study';
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        setShowShareMenu(false);
    };

    const handleShareFacebook = () => {
        const url = window.location.href;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        setShowShareMenu(false);
    };

    if (isLoading) {
        return (
            <div className={cn(
                "flex min-h-screen bg-gradient-to-b from-background to-background/95",
                "transition-opacity duration-300",
                isTransitioning ? "opacity-50" : "opacity-100"
            )}>
                <div className="flex-1">
                    <div className="p-4 border-t border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                        <div className="max-w-4xl mx-auto">
                            <div className="h-6 w-48 bg-muted-foreground/20 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto py-5">
                        <div className="max-w-4xl mx-auto">
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                                <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !study) {
        return (
            <div className={cn(
                "flex min-h-screen bg-gradient-to-b from-background to-background/95 items-center justify-center",
                "transition-opacity duration-300",
                isTransitioning ? "opacity-50" : "opacity-100"
            )}>
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <BookMarked className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-medium">Study not found</h2>
                    <p className="text-muted-foreground">This Bible study may have been deleted or is not accessible.</p>
                    <Link
                        href="/study/bible-study"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Bible Study
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex min-h-screen bg-gradient-to-b from-background to-background/95",
            "transition-opacity duration-300",
            isTransitioning ? "opacity-50" : "opacity-100"
        )}>
            <div className="flex-1">
                {/* Header Card */}
                <div className="sticky top-0 z-10 p-3 sm:p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative bg-card text-card-foreground rounded-2xl border shadow-sm">
                            {/* Top Section */}
                            <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <button
                                            onClick={() => navigateWithTransition('/study/bible-study')}
                                            className="flex-none p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div className="min-w-0">
                                            <h1 className="font-semibold text-base sm:text-lg truncate">
                                                {study.query || 'Untitled Study'}
                                            </h1>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {study.public ? 'Public Bible study' : 'Private Bible study'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-none">
                                        <div className="relative" ref={shareMenuRef}>
                                            <button
                                                onClick={handleShare}
                                                className="p-2.5 hover:bg-muted rounded-full transition-colors relative"
                                            >
                                                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                            {showShareMenu && (
                                                <div className="absolute right-0 mt-2 w-72 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden z-[60]">
                                                    <div className="px-4 py-3 border-b border-border bg-muted/50">
                                                        <h3 className="font-medium">Share this study</h3>
                                                        <p className="text-xs text-muted-foreground mt-0.5">Choose how you want to share this Bible study</p>
                                                    </div>
                                                    <div className="p-2">
                                                        <button
                                                            onClick={handleCopyLink}
                                                            className="w-full px-3 py-2.5 text-left rounded-xl hover:bg-muted transition-colors flex items-center gap-3 group"
                                                        >
                                                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                                <Link2 className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium">Copy link</div>
                                                                <div className="text-xs text-muted-foreground">Share via URL</div>
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={handleShareTwitter}
                                                            className="w-full px-3 py-2.5 text-left rounded-xl hover:bg-muted transition-colors flex items-center gap-3 group mt-1"
                                                        >
                                                            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                                                <Twitter className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium">Twitter</div>
                                                                <div className="text-xs text-muted-foreground">Share on Twitter</div>
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={handleShareFacebook}
                                                            className="w-full px-3 py-2.5 text-left rounded-xl hover:bg-muted transition-colors flex items-center gap-3 group mt-1"
                                                        >
                                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                                <Facebook className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium">Facebook</div>
                                                                <div className="text-xs text-muted-foreground">Share on Facebook</div>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {showShareTooltip && (
                                                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-popover border border-border text-popover-foreground text-xs rounded-xl shadow-lg whitespace-nowrap flex items-center gap-2 z-[60]">
                                                    <div className="p-1 rounded-full bg-green-500/10">
                                                        <Check className="w-3 h-3 text-green-500" />
                                                    </div>
                                                    {shareTooltipText}
                                                </div>
                                            )}
                                        </div>
                                        <Link
                                            href="/study/bible-study"
                                            className="inline-flex items-center gap-2 px-3.5 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span className="hidden sm:inline">New Study</span>
                                            <span className="sm:hidden">New</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {/* Bottom Section - Metadata */}
                            <div className="px-4 sm:px-6 py-3 bg-muted/50 border-t flex items-center gap-3 text-sm text-muted-foreground">
                                <time>{study._createdDate ? formatDistanceToNow(new Date(study._createdDate)) : 'Recently'} ago</time>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Study Content */}
                <div className="flex-1 overflow-y-auto py-4 sm:py-8">
                    <div className="max-w-4xl mx-auto sm:px-4">
                        <EnhancedBibleStudy
                            verses={study.verses}
                            crossReferences={study.crossReferences}
                            explanation={study.explanation}
                            query={study.query}
                            onGenerateCommentary={handleGenerateCommentary}
                            onSaveCommentary={handleSaveCommentary}
                            onGenerateCrossReferenceMap={handleGenerateCrossReferenceMap}
                            initialCommentaries={study.commentaries || []}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 