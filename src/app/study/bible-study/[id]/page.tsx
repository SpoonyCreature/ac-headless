'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, BookMarked, Globe, Lock, ChevronLeft, Share2, Plus, ArrowLeft, Link2, Twitter, Facebook, Check, EyeOff, Loader2, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { EnhancedBibleStudy } from '@/src/components/EnhancedBibleStudy';
import { BibleStudy as BaseBibleStudy } from '@/src/types/bible';
import { cn } from '@/src/lib/utils';
import { usePageTransition } from '@/src/hooks/usePageTransition';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

interface CommentaryResponse {
    markdown: string;
}

interface Commentary {
    verseRef: string;
    commentary: CommentaryResponse;
    timestamp: number;
}

type BibleStudy = BaseBibleStudy & {
    originalVerses?: {
        language: string;
        verses: {
            text: string;
            reference: string;
        }[];
    }[];
    verses: any[];
    crossReferences?: any[];
    explanation?: string;
    commentaries?: Commentary[];
    content?: string;
    speechContent?: string;
}

interface AudioChunk {
    index: number;
    buffer: AudioBuffer;
}

export default function BibleStudyDetailPage({
    params
}: {
    params: { id: string }
}) {
    const [study, setStudy] = useState<BibleStudy | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'content'>('details');
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [studyContent, setStudyContent] = useState<string | null>(null);
    const [speechContent, setSpeechContent] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showShareTooltip, setShowShareTooltip] = useState(false);
    const [shareTooltipText, setShareTooltipText] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [isUpdatingPublic, setIsUpdatingPublic] = useState(false);
    const { isTransitioning, navigateWithTransition } = usePageTransition();
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isCheckingAudio, setIsCheckingAudio] = useState(false);

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
                const [studyResponse, authResponse] = await Promise.all([
                    fetch(`/api/bible-study/${params.id}`),
                    fetch('/api/auth/me')
                ]);

                if (!studyResponse.ok) {
                    throw new Error('Failed to fetch study');
                }

                const data = await studyResponse.json();
                const authData = await authResponse.json();

                // Check if user is owner
                setIsOwner(authData.user?._id === data.study._owner);

                // Check if user has access
                if (!data.study.public && authData.user?._id !== data.study._owner) {
                    throw new Error('This study is private');
                }

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

    const handleGenerateCommentary = async (verseRef: string, previousCommentaries: Commentary[]): Promise<CommentaryResponse> => {
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

    const handleTogglePublic = async () => {
        if (!study || !isOwner || isUpdatingPublic) return;

        setIsUpdatingPublic(true);
        try {
            const response = await fetch(`/api/bible-study/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    public: !study.public
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update study visibility');
            }

            setStudy(prev => prev ? { ...prev, public: !prev.public } : null);
        } catch (err) {
            console.error('Error updating study visibility:', err);
        } finally {
            setIsUpdatingPublic(false);
        }
    };

    const generateStudyContent = async () => {
        if (!study) return;

        setIsGeneratingContent(true);
        try {
            const response = await fetch('/api/bible-study/generate-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verses: study.verses,
                    originalVerses: study.originalVerses,
                    query: study.query,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate study content');
            }

            const data = await response.json();
            setStudyContent(data.content);
            setSpeechContent(data.speechContent);

            // Persist the content to the study
            const updateResponse = await fetch(`/api/bible-study/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: data.content,
                    speechContent: data.speechContent
                }),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to persist study content');
            }
        } catch (error) {
            console.error('Error generating study content:', error);
        } finally {
            setIsGeneratingContent(false);
        }
    };

    // Function to play audio from URL
    const playAudioFromUrl = (url: string) => {
        const audio = new Audio(url);
        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);
        audio.onended = () => setIsPlaying(false);
        audio.play();
        return audio;
    };

    // Add function to check for existing audio
    const checkExistingAudio = async () => {
        setIsCheckingAudio(true);
        try {
            const response = await fetch('/api/bible-study/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: '', // Empty text indicates we're just checking for existing audio
                    studyId: params.id,
                    checkOnly: true
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.audioUrl) {
                    setAudioUrl(data.audioUrl);
                }
            }
        } catch (error) {
            console.error('Error checking audio:', error);
        } finally {
            setIsCheckingAudio(false);
        }
    };

    // Check for existing audio when study content is loaded
    useEffect(() => {
        if (study?.content) {
            checkExistingAudio();
        }
    }, [study?.content]);

    // Update handlePlayPause to use existing audioUrl
    const handlePlayPause = async () => {
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }

        if (!studyContent) return;

        if (audioUrl) {
            audioRef.current = playAudioFromUrl(audioUrl);
            return;
        }

        setIsLoadingAudio(true);
        try {
            const textToSpeak = speechContent || markdownToPlainText(studyContent);

            const response = await fetch('/api/bible-study/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: textToSpeak,
                    studyId: params.id
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate audio');
            }

            const data = await response.json();

            if (data.audioUrl) {
                setAudioUrl(data.audioUrl);
                audioRef.current = playAudioFromUrl(data.audioUrl);
            }
        } catch (error) {
            console.error('Error handling audio:', error);
        } finally {
            setIsLoadingAudio(false);
        }
    };

    // Clean up audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Load persisted content when study is loaded
    useEffect(() => {
        if (study?.content) {
            setStudyContent(study.content);
        }
        if (study?.speechContent) {
            setSpeechContent(study.speechContent);
        }
    }, [study]);

    // Function to convert markdown to plain text
    const markdownToPlainText = (markdown: string): string => {
        // Convert markdown to HTML and ensure it's a string
        const html = String(marked.parse(markdown));
        // Sanitize HTML
        const sanitizedHtml = DOMPurify.sanitize(html);
        // Create a temporary element to hold the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizedHtml;
        // Get text content and normalize whitespace
        return tempDiv.textContent || tempDiv.innerText || '';
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

    if (error) {
        return (
            <div className={cn(
                "flex min-h-screen bg-gradient-to-b from-background to-background/95 items-center justify-center",
                "transition-opacity duration-300",
                isTransitioning ? "opacity-50" : "opacity-100"
            )}>
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
                        <EyeOff className="w-6 h-6 text-destructive" />
                    </div>
                    <h2 className="text-xl font-medium">{error}</h2>
                    <p className="text-muted-foreground">
                        {error === 'This study is private'
                            ? "This Bible study is private and can only be viewed by its owner."
                            : "This Bible study may have been deleted or is not accessible."}
                    </p>
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

    if (!study) return null;

    return (
        <div className={cn(
            "flex min-h-screen bg-gradient-to-b from-background to-background/95",
            "transition-opacity duration-300",
            isTransitioning ? "opacity-50" : "opacity-100"
        )}>
            <div className="flex-1 container px-4 py-4 mx-auto">
                {/* Header Card */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="max-w-4xl mx-auto sm:px-4">
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
                                        {isOwner && (
                                            <div className="relative">
                                                <button
                                                    onClick={handleTogglePublic}
                                                    disabled={isUpdatingPublic}
                                                    className={cn(
                                                        "group inline-flex items-center gap-2 px-3.5 h-10 rounded-full transition-all text-sm",
                                                        "hover:shadow-md active:shadow-sm",
                                                        study.public
                                                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                                                            : "bg-muted/50 text-muted-foreground hover:bg-muted/80",
                                                        isUpdatingPublic && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "w-2 h-2 rounded-full transition-colors",
                                                        study.public ? "bg-primary" : "bg-muted-foreground"
                                                    )} />
                                                    {study.public ? (
                                                        <>
                                                            <Globe className="w-4 h-4" />
                                                            <span className="hidden sm:inline">Public</span>
                                                            <span className="hidden sm:inline text-xs text-muted-foreground">• Anyone can view</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="w-4 h-4" />
                                                            <span className="hidden sm:inline">Private</span>
                                                            <span className="hidden sm:inline text-xs text-muted-foreground">• Only you can view</span>
                                                        </>
                                                    )}
                                                </button>
                                                {isUpdatingPublic && (
                                                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 bg-popover border border-border rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md">
                                                        <div className="flex items-center gap-1.5">
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                            <span>Updating visibility...</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Share Menu */}
                                        <div className="relative" ref={shareMenuRef}>
                                            <button
                                                onClick={handleShare}
                                                className={cn(
                                                    "p-2.5 rounded-full transition-colors relative",
                                                    "hover:shadow-md active:shadow-sm",
                                                    study.public
                                                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                                                        : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
                                                )}
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

                {/* Tabs */}
                <div className="max-w-4xl mx-auto sm:px-4 mt-4">
                    <div className="flex space-x-4 border-b border-border/50">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={cn(
                                "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'details'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('content')}
                            className={cn(
                                "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'content'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Bible Study Content
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-4 sm:py-8">
                    <div className="max-w-4xl mx-auto sm:px-4">
                        {activeTab === 'details' ? (
                            <EnhancedBibleStudy
                                verses={study.verses}
                                crossReferences={study.crossReferences}
                                explanation={study.explanation}
                                query={study.query}
                                onGenerateCommentary={isOwner ? handleGenerateCommentary : undefined}
                                onSaveCommentary={isOwner ? handleSaveCommentary : undefined}
                                onGenerateCrossReferenceMap={isOwner ? handleGenerateCrossReferenceMap : undefined}
                                initialCommentaries={study.commentaries || []}
                            />
                        ) : (
                            <div className="space-y-6">
                                {!studyContent && !isGeneratingContent && (
                                    <div className="text-center py-12">
                                        <h3 className="text-lg font-medium mb-2">No Bible Study Content Yet</h3>
                                        <p className="text-muted-foreground mb-6">Generate an AI-powered Bible study guide for your group.</p>
                                        <button
                                            onClick={generateStudyContent}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                        >
                                            <Bot className="w-4 h-4" />
                                            Generate Bible Study
                                        </button>
                                    </div>
                                )}

                                {isGeneratingContent && (
                                    <div className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                                        <h3 className="text-lg font-medium mb-2">Generating Bible Study Content</h3>
                                        <p className="text-muted-foreground">This may take a minute...</p>
                                    </div>
                                )}

                                {studyContent && !isGeneratingContent && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-2xl font-semibold">Bible Study Guide</h2>
                                            <button
                                                onClick={handlePlayPause}
                                                disabled={isLoadingAudio || isCheckingAudio}
                                                className={cn(
                                                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                                                    isPlaying
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                                                    (isLoadingAudio || isCheckingAudio) && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {isLoadingAudio ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Generating Audio...</span>
                                                    </>
                                                ) : isCheckingAudio ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Checking Audio...</span>
                                                    </>
                                                ) : isPlaying ? (
                                                    <>
                                                        <Pause className="w-4 h-4" />
                                                        <span>Pause Study</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4" />
                                                        <span>{audioUrl ? 'Play Study' : 'Generate Audio'}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="space-y-6">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeRaw]}
                                                components={{
                                                    p: ({ node, ...props }) => (
                                                        <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
                                                    ),
                                                    em: ({ node, ...props }) => (
                                                        <em className="italic text-foreground font-normal" {...props} />
                                                    ),
                                                    strong: ({ node, ...props }) => (
                                                        <strong className="font-semibold text-foreground" {...props} />
                                                    ),
                                                    h1: ({ node, ...props }) => (
                                                        <h1 className="text-2xl font-semibold tracking-tight mt-8 mb-4" {...props} />
                                                    ),
                                                    h2: ({ node, ...props }) => (
                                                        <h2 className="text-xl font-semibold tracking-tight mt-8 mb-4" {...props} />
                                                    ),
                                                    h3: ({ node, ...props }) => (
                                                        <h3 className="text-lg font-semibold tracking-tight mt-8 mb-4" {...props} />
                                                    ),
                                                    blockquote: ({ node, ...props }) => (
                                                        <blockquote className="mt-6 border-l-2 border-primary/50 pl-6 italic text-muted-foreground" {...props} />
                                                    ),
                                                    ul: ({ node, ...props }) => (
                                                        <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
                                                    ),
                                                    ol: ({ node, ...props }) => (
                                                        <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
                                                    ),
                                                    code: ({ node, inline, className, children, ...props }: {
                                                        node?: any;
                                                        inline?: boolean;
                                                        className?: string;
                                                        children?: React.ReactNode;
                                                    } & React.HTMLAttributes<HTMLElement>) =>
                                                        inline ? (
                                                            <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm" {...props}>{children}</code>
                                                        ) : (
                                                            <pre className="mt-6 mb-4 overflow-x-auto rounded-lg bg-muted p-4">
                                                                <code className="relative rounded bg-muted font-mono text-sm" {...props}>{children}</code>
                                                            </pre>
                                                        )
                                                }}
                                            >
                                                {studyContent}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 