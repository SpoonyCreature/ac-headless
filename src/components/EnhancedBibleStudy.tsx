import { useState } from 'react';
import { Lightbulb, RefreshCw, BookOpen, Languages, Copy, Network, MessageSquare, Info, ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { BibleVerse, CrossReference } from '@/src/types/bible';
import { VerseTimeline } from './VerseTimeline';
import { FormattedVerseText } from './FormattedVerseText';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface CommentaryResponse {
    markdown: string;
}

interface Commentary {
    verseRef: string;
    commentary: CommentaryResponse;
    timestamp: number;
}

interface EnhancedBibleStudyProps {
    verses: BibleVerse[];
    crossReferences?: CrossReference[];
    explanation?: string;
    query?: string;
    onGenerateCommentary?: (verseRef: string, previousCommentaries: Commentary[]) => Promise<CommentaryResponse>;
    onGenerateCrossReferenceMap?: (verse: BibleVerse) => Promise<void>;
    onSaveCommentary?: (verseRef: string, commentary: CommentaryResponse) => Promise<void>;
    initialCommentaries?: Commentary[];
}

export function EnhancedBibleStudy({
    verses,
    crossReferences,
    explanation,
    query,
    onGenerateCommentary,
    onGenerateCrossReferenceMap,
    onSaveCommentary,
    initialCommentaries = []
}: EnhancedBibleStudyProps) {
    const [commentaries, setCommentaries] = useState<Commentary[]>(initialCommentaries);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [activeVerse, setActiveVerse] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'verse' | 'commentary' | 'cross-references'>('verse');
    const [generatingCrossRefs, setGeneratingCrossRefs] = useState<string | null>(null);
    const [showOriginalText, setShowOriginalText] = useState<Record<number, boolean>>({});
    const [activeVerseTab, setActiveVerseTab] = useState<Record<number, string>>({});

    const handleGenerateCommentary = async (verseRef: string) => {
        if (isLoading || !onGenerateCommentary) return;

        setIsLoading(verseRef);
        try {
            // Get previous commentaries up to this verse's position
            const verseIndex = verses.findIndex(v => `${v.reference}` === verseRef);
            const previousVerses = verses.slice(0, verseIndex);
            const relevantCommentaries = commentaries
                .filter(c => previousVerses.some(v => `${v.reference}` === c.verseRef))
                .sort((a, b) => a.timestamp - b.timestamp);

            const newCommentary = await onGenerateCommentary(verseRef, relevantCommentaries);

            // Save the commentary if handler provided
            if (onSaveCommentary) {
                await onSaveCommentary(verseRef, newCommentary);
            }

            // Remove any existing commentary for this verse and add the new one
            setCommentaries(prev => [
                ...prev.filter(c => c.verseRef !== verseRef),
                {
                    verseRef,
                    commentary: newCommentary,
                    timestamp: Date.now()
                }
            ]);
        } catch (error) {
            console.error('Failed to generate commentary:', error);
        } finally {
            setIsLoading(null);
        }
    };

    const handleGenerateCrossRefs = async (verse: BibleVerse) => {
        const verseRef = `${verse.reference}`;
        setGeneratingCrossRefs(verseRef);
        try {
            await onGenerateCrossReferenceMap?.(verse);
        } finally {
            setGeneratingCrossRefs(null);
        }
    };

    const handleCopyVerse = (verse: BibleVerse) => {
        const text = `${verse.reference} - ${verse.verses?.map(v => v.text).join(' ')}`;
        navigator.clipboard.writeText(text);
        // TODO: Add toast notification
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
                {/* Study Overview Card */}
                {explanation && (
                    <div className="md:col-span-2 relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-3xl opacity-50" />
                        <div className="relative p-3 sm:p-6 space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2 sm:gap-3 text-primary">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <h2 className="text-base sm:text-lg font-medium">Study Overview</h2>
                            </div>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{explanation}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-3 pt-1 sm:pt-2">
                                <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground bg-muted/50 px-2.5 sm:px-3 py-1.5 rounded-full">
                                    <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span>{verses.length} verses</span>
                                </div>
                                {crossReferences && crossReferences.length > 0 && (
                                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground bg-muted/50 px-2.5 sm:px-3 py-1.5 rounded-full">
                                        <Network className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        <span>{crossReferences.length} cross-references</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground bg-muted/50 px-2.5 sm:px-3 py-1.5 rounded-full">
                                    <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span>Original text available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Guide Card */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-3xl opacity-50" />
                    <div className="relative p-3 sm:p-6 space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3 text-primary">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <h2 className="text-base sm:text-lg font-medium">Quick Guide</h2>
                        </div>
                        <div className="grid gap-1.5 sm:gap-3">
                            <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium mb-0.5">Read & Compare</h3>
                                    <p className="text-xs text-muted-foreground">View verses in English and original languages</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium mb-0.5">Study Deeper</h3>
                                    <p className="text-xs text-muted-foreground">Get AI-powered verse commentary</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Network className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium mb-0.5">Connect Scripture</h3>
                                    <p className="text-xs text-muted-foreground">Explore related verses on the timeline</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verse Timeline */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-3xl opacity-50" />
                <div className="relative p-3 sm:p-6 space-y-3 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 text-primary">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Network className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <h2 className="text-base sm:text-lg font-medium">Verse Timeline</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span>Old Testament</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>New Testament</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {verses?.map((verse, index) => {
                            const verseRef = `${verse.reference}`;
                            const verseCrossRefs = crossReferences?.filter(ref => ref.sourceReference === verseRef) || [];
                            const [book] = verseRef.split(' ');
                            const isOldTestament = !['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', 'Thessalonians', 'Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', 'Peter', 'John', 'Jude', 'Revelation'].some(b => verseRef.startsWith(b));

                            return (
                                <button
                                    key={verseRef}
                                    onClick={() => {
                                        const element = document.getElementById(`verse-${index}`);
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth' });
                                            element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
                                            setTimeout(() => {
                                                element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
                                            }, 2000);
                                        }
                                    }}
                                    className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-all duration-300"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="p-2.5 sm:p-4 flex gap-2 sm:gap-4">
                                        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                                            {index + 1}

                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-1.5">
                                                <span className="font-medium text-sm">{verseRef}</span>
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    isOldTestament ? "bg-amber-500" : "bg-blue-500"
                                                )} />
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5 sm:mb-2">
                                                {verse.verses?.[0]?.text}
                                            </p>
                                            {verseCrossRefs.length > 0 && (
                                                <div className="flex items-center gap-1.5 text-xs text-primary/70">
                                                    <Network className="w-3 h-3" />
                                                    <span>{verseCrossRefs.length} references</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                    </div>
                </div>
            </div>

            {/* Sequential Study */}
            <div className="relative space-y-6 sm:space-y-8">
                {verses?.map((verse, index) => {
                    if (!verse?.verses) return null;

                    const commentary = commentaries.find(c => c.verseRef === `${verse.reference}`);
                    const hasCommentary = !!commentary;
                    const isGenerating = isLoading === `${verse.reference}`;
                    const verseRef = `${verse.reference}`;
                    const verseCrossRefs = crossReferences?.filter(ref => ref.sourceReference === verseRef) || [];
                    const activeTab = activeVerseTab[index] || 'text';

                    return (
                        <div
                            id={`verse-${index}`}
                            key={verseRef}
                            className={cn(
                                "group relative rounded-2xl border border-border/50 transition-all duration-300",
                                "bg-card shadow-lg overflow-hidden"
                            )}
                        >
                            {/* Verse Header */}
                            <div className="p-3 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 gap-3 sm:gap-4">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className={cn(
                                        "w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors shrink-0",
                                        hasCommentary ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                    )}>
                                        <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-medium text-foreground">{verseRef}</h3>
                                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                            {verse.originalText && (
                                                <span className="inline-flex items-center gap-1 text-xs text-primary/70">
                                                    <Languages className="w-3 h-3" />
                                                    {verse.originalText.language === 'hebrew' ? 'Hebrew' : 'Greek'}
                                                </span>
                                            )}
                                            {verseCrossRefs.length > 0 && (
                                                <span className="inline-flex items-center gap-1 text-xs text-primary/70">
                                                    <Network className="w-3 h-3" />
                                                    {verseCrossRefs.length}
                                                </span>
                                            )}
                                            {hasCommentary && (
                                                <span className="inline-flex items-center gap-1 text-xs text-primary/70">
                                                    <MessageSquare className="w-3 h-3" />
                                                    Commentary
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    {verse.originalText && (
                                        <button
                                            onClick={() => setShowOriginalText(prev => ({ ...prev, [index]: !prev[index] }))}
                                            className={cn(
                                                "p-1.5 sm:p-2 rounded-lg transition-colors",
                                                showOriginalText[index] ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                            )}
                                            title={`Toggle ${verse.originalText.language} text`}
                                        >
                                            <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleCopyVerse(verse)}
                                        className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                                        title="Copy verse"
                                    >
                                        <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Main Verse Content */}
                            <div className="p-3 sm:p-6">
                                <div className="relative rounded-xl bg-muted/30 p-3 sm:p-6">
                                    <FormattedVerseText verses={verse.verses} />
                                    {verse.originalText && showOriginalText[index] && (
                                        <div className="mt-3 sm:mt-6 pt-3 sm:pt-6 border-t border-border/50">
                                            <div className="flex items-center gap-2 mb-2 sm:mb-3 text-sm text-muted-foreground">
                                                <Languages className="w-4 h-4" />
                                                <span>Original {verse.originalText.language} Text</span>
                                            </div>
                                            <div
                                                className={cn(
                                                    "font-serif text-base sm:text-lg leading-relaxed p-3 sm:p-4 rounded-lg bg-background/50",
                                                    verse.originalText.language === 'hebrew' ? "text-right" : "text-left"
                                                )}
                                                dir={verse.originalText.language === 'hebrew' ? 'rtl' : 'ltr'}
                                            >
                                                <FormattedVerseText
                                                    verses={verse.originalText.verses}
                                                    className={cn(
                                                        "font-serif",
                                                        verse.originalText.language === 'hebrew' ? "text-right" : "text-left"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                                    {verse.originalText && (
                                        <button
                                            onClick={() => setShowOriginalText(prev => ({ ...prev, [index]: !prev[index] }))}
                                            className={cn(
                                                "flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-sm",
                                                showOriginalText[index] ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                            )}
                                        >
                                            <Languages className="w-4 h-4" />
                                            {showOriginalText[index] ? 'Hide Original' : 'Show Original'}
                                        </button>
                                    )}
                                    <a
                                        href={`https://biblehub.com/${verse.reference.toLowerCase()}.htm`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Study Tools
                                    </a>
                                </div>
                            </div>

                            {/* Navigation for Additional Content */}
                            <div className="px-3 sm:px-6">
                                <div className="border-t border-border/50 -mx-3 sm:-mx-6" />

                                {/* Desktop Tabs */}
                                <div className="hidden sm:flex items-center gap-2 py-3 sm:py-4">
                                    <button
                                        onClick={() => setActiveVerseTab(prev => ({ ...prev, [index]: 'commentary' }))}
                                        className={cn(
                                            "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-all",
                                            activeTab === 'commentary'
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                        )}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="hidden sm:inline">Commentary</span>
                                        {hasCommentary && (
                                            <span className="w-2 h-2 rounded-full bg-primary-foreground" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setActiveVerseTab(prev => ({ ...prev, [index]: 'references' }))}
                                        className={cn(
                                            "flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-all",
                                            activeTab === 'references'
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                        )}
                                    >
                                        <Network className="w-4 h-4" />
                                        <span className="hidden sm:inline">Cross References</span>
                                        {verseCrossRefs.length > 0 && (
                                            <span className="min-w-[1.25rem] h-5 flex items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground text-xs px-1">
                                                {verseCrossRefs.length}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Mobile Action Menu */}
                                <div className="sm:hidden flex flex-col bg-muted/30 rounded-lg overflow-hidden py-1 my-3 sm:my-4">
                                    <button
                                        onClick={() => setActiveVerseTab(prev => ({ ...prev, [index]: 'commentary' }))}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-2 text-sm font-medium transition-all",
                                            activeTab === 'commentary'
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>Commentary</span>
                                            {hasCommentary && (
                                                <span className="text-xs bg-primary-foreground/20 text-primary-foreground px-2 py-0.5 rounded-full">Available</span>
                                            )}
                                        </div>
                                        {activeTab === 'commentary' && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setActiveVerseTab(prev => ({ ...prev, [index]: 'references' }))}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-2 text-sm font-medium transition-all border-t border-border/10",
                                            activeTab === 'references'
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Network className="w-4 h-4" />
                                            <span>Cross References</span>
                                            {verseCrossRefs.length > 0 && (
                                                <span className="min-w-[1.25rem] h-5 flex items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground text-xs px-1.5">
                                                    {verseCrossRefs.length}
                                                </span>
                                            )}
                                        </div>
                                        {activeTab === 'references' && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Additional Content */}
                            {(activeTab === 'commentary' || activeTab === 'references') && (
                                <div className="border-t border-border/50">
                                    <div className="p-3 sm:p-6">
                                        {activeTab === 'commentary' && (
                                            <div className="space-y-4">
                                                {hasCommentary ? (
                                                    <div className="space-y-4">
                                                        <div className="prose prose-sm max-w-none dark:prose-invert">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                rehypePlugins={[rehypeRaw]}
                                                                components={{
                                                                    h1: ({ node, ...props }) => <h1 className="text-lg font-semibold mb-3 mt-0 text-primary/80" {...props} />,
                                                                    h2: ({ node, ...props }) => <h2 className="text-base font-medium mb-2 mt-4 text-primary/70" {...props} />,
                                                                    h3: ({ node, ...props }) => <h3 className="text-sm font-medium mb-2 mt-3 text-primary/60" {...props} />,
                                                                    p: ({ node, ...props }) => <p className="text-sm text-muted-foreground mb-3 leading-relaxed" {...props} />,
                                                                    ul: ({ node, ...props }) => <ul className="text-sm list-disc pl-4 mb-3 text-muted-foreground" {...props} />,
                                                                    ol: ({ node, ...props }) => <ol className="text-sm list-decimal pl-4 mb-3 text-muted-foreground" {...props} />,
                                                                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                                    blockquote: ({ node, ...props }) => (
                                                                        <blockquote className="border-l-2 border-primary/20 pl-3 italic my-3 text-sm text-muted-foreground/80" {...props} />
                                                                    ),
                                                                    code: ({ node, inline, className, children, ...props }: {
                                                                        node?: any;
                                                                        inline?: boolean;
                                                                        className?: string;
                                                                        children?: React.ReactNode;
                                                                    } & React.HTMLAttributes<HTMLElement>) =>
                                                                        inline ? (
                                                                            <code className="bg-muted px-1 py-0.5 text-xs rounded" {...props}>{children}</code>
                                                                        ) : (
                                                                            <code className="block bg-muted p-3 my-3 text-xs rounded overflow-x-auto" {...props}>{children}</code>
                                                                        ),
                                                                    a: ({ node, ...props }) => (
                                                                        <a className="text-primary/80 hover:text-primary no-underline hover:underline" {...props} />
                                                                    ),
                                                                    strong: ({ node, ...props }) => <strong className="font-medium text-foreground" {...props} />,
                                                                    em: ({ node, ...props }) => <em className="italic text-primary/70" {...props} />,
                                                                }}
                                                            >
                                                                {commentary.commentary.markdown}
                                                            </ReactMarkdown>
                                                        </div>
                                                        {onGenerateCommentary && (
                                                            <button
                                                                onClick={() => handleGenerateCommentary(verseRef)}
                                                                disabled={isGenerating}
                                                                className="flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                                                            >
                                                                <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                                                                Regenerate Commentary
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 sm:py-6">
                                                        <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                                                        <h3 className="text-base sm:text-lg font-medium mb-2">No Commentary Available</h3>
                                                        <p className="text-sm text-muted-foreground mb-3 sm:mb-4 max-w-md mx-auto">
                                                            {onGenerateCommentary
                                                                ? "Generate AI-powered commentary to explore deeper insights into this verse."
                                                                : "No commentary has been generated for this verse yet."}
                                                        </p>
                                                        {onGenerateCommentary && (
                                                            <button
                                                                onClick={() => handleGenerateCommentary(verseRef)}
                                                                disabled={isGenerating}
                                                                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                                                            >
                                                                {isGenerating ? (
                                                                    <>
                                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                                        Generating...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <MessageSquare className="w-4 h-4" />
                                                                        Generate Commentary
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'references' && (
                                            <div className="space-y-4">
                                                {verseCrossRefs.length > 0 ? (
                                                    <>
                                                        {/* Timeline Section */}
                                                        <div className="bg-muted/30 rounded-xl p-3 sm:p-6 space-y-3 sm:space-y-4">
                                                            <h5 className="text-sm font-medium text-primary/70">Biblical Timeline</h5>
                                                            <div className="max-w-3xl mx-auto overflow-x-auto">
                                                                <VerseTimeline
                                                                    sourceReference={verseRef}
                                                                    crossReferences={verseCrossRefs}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Cross References List */}
                                                        <div className="space-y-3 sm:space-y-4">
                                                            {verseCrossRefs.map((ref, idx) => (
                                                                <div key={idx} className="rounded-lg bg-muted/30 p-3 sm:p-4 space-y-2 sm:space-y-3">
                                                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                                                        <h4 className="font-medium text-primary text-sm sm:text-base">{ref.reference}</h4>
                                                                        <span className="text-xs text-muted-foreground">{ref.period}</span>
                                                                    </div>
                                                                    <p className="text-sm italic border-l-2 border-primary/20 pl-3">{ref.text}</p>
                                                                    <p className="text-xs sm:text-sm text-muted-foreground">{ref.connection}</p>
                                                                    {ref.originalText && (
                                                                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50">
                                                                            <div className="text-xs text-muted-foreground mb-2">
                                                                                Original {ref.originalText.language}:
                                                                            </div>
                                                                            <div
                                                                                className={cn(
                                                                                    "p-2 sm:p-3 bg-background/50 rounded-lg font-serif text-xs sm:text-sm",
                                                                                    ref.originalText.language === 'hebrew' ? "text-right" : "text-left"
                                                                                )}
                                                                                dir={ref.originalText.language === 'hebrew' ? 'rtl' : 'ltr'}
                                                                            >
                                                                                {ref.originalText.text}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {onGenerateCrossReferenceMap && (
                                                            <button
                                                                onClick={() => handleGenerateCrossRefs(verse)}
                                                                disabled={generatingCrossRefs === verseRef}
                                                                className="flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                                                            >
                                                                <RefreshCw className={cn("w-4 h-4", generatingCrossRefs === verseRef && "animate-spin")} />
                                                                Find More References
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="text-center py-4 sm:py-6">
                                                        <Network className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                                                        <h3 className="text-base sm:text-lg font-medium mb-2">No Cross References Available</h3>
                                                        <p className="text-sm text-muted-foreground mb-3 sm:mb-4 max-w-md mx-auto">
                                                            {onGenerateCrossReferenceMap
                                                                ? "Find connections between this verse and other parts of Scripture."
                                                                : "No cross references have been generated for this verse yet."}
                                                        </p>
                                                        {onGenerateCrossReferenceMap && (
                                                            <button
                                                                onClick={() => handleGenerateCrossRefs(verse)}
                                                                disabled={generatingCrossRefs === verseRef}
                                                                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                                                            >
                                                                {generatingCrossRefs === verseRef ? (
                                                                    <>
                                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                                        Finding Connections...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Network className="w-4 h-4" />
                                                                        Find Cross References
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 
