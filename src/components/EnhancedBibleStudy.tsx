import { useState } from 'react';
import { Lightbulb, RefreshCw, BookOpen, Languages, Copy, Network, MessageSquare, Info, ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { BibleVerse, CrossReference } from '@/src/types/bible';
import { VerseTimeline } from './VerseTimeline';

interface CommentarySection {
    title: string;
    content: {
        type: 'text' | 'greek' | 'hebrew' | 'emphasis' | 'reference';
        text: string;
    }[];
}

interface CommentaryResponse {
    sections: CommentarySection[];
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
    onGenerateCommentary: (verseRef: string, previousCommentaries: Commentary[]) => Promise<CommentaryResponse>;
    onGenerateCrossReferenceMap?: (verse: BibleVerse) => Promise<void>;
}

export function EnhancedBibleStudy({
    verses,
    crossReferences,
    explanation,
    query,
    onGenerateCommentary,
    onGenerateCrossReferenceMap,
}: EnhancedBibleStudyProps) {
    const [commentaries, setCommentaries] = useState<Commentary[]>([]);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [activeVerse, setActiveVerse] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'verse' | 'commentary' | 'cross-references'>('verse');
    const [generatingCrossRefs, setGeneratingCrossRefs] = useState<string | null>(null);
    const [showOriginalText, setShowOriginalText] = useState<Record<number, boolean>>({});
    const [activeVerseTab, setActiveVerseTab] = useState<Record<number, 'text' | 'commentary' | 'references'>>({});

    const handleGenerateCommentary = async (verseRef: string) => {
        if (isLoading) return;

        setIsLoading(verseRef);
        try {
            // Get previous commentaries up to this verse's position
            const verseIndex = verses.findIndex(v => `${v.bookName} ${v.chapter}:${v.verse}` === verseRef);
            const previousVerses = verses.slice(0, verseIndex);
            const relevantCommentaries = commentaries
                .filter(c => previousVerses.some(v => `${v.bookName} ${v.chapter}:${v.verse}` === c.verseRef))
                .sort((a, b) => a.timestamp - b.timestamp);

            const newCommentary = await onGenerateCommentary(verseRef, relevantCommentaries);

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
        const verseRef = `${verse.bookName} ${verse.chapter}:${verse.verse}`;
        setGeneratingCrossRefs(verseRef);
        try {
            await onGenerateCrossReferenceMap?.(verse);
        } finally {
            setGeneratingCrossRefs(null);
        }
    };

    const handleCopyVerse = (verse: BibleVerse) => {
        const text = `${verse.bookName} ${verse.chapter}:${verse.verse} - ${verse.text}`;
        navigator.clipboard.writeText(text);
        // TODO: Add toast notification
    };

    const renderContent = (content: CommentarySection['content']) => {
        return content.map((item, index) => {
            switch (item.type) {
                case 'greek':
                    return <span key={index} className="font-serif text-primary/80 italic">{item.text}</span>;
                case 'hebrew':
                    return <span key={index} className="font-serif text-primary/80 italic" dir="rtl">{item.text}</span>;
                case 'emphasis':
                    return <strong key={index} className="font-medium text-foreground">{item.text}</strong>;
                case 'reference':
                    return <span key={index} className="text-primary underline decoration-primary/30 underline-offset-2">{item.text}</span>;
                default:
                    return <span key={index}>{item.text}</span>;
            }
        });
    };

    return (
        <div className="space-y-12">
            {/* Study Overview */}
            {explanation && (
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-3xl" />
                    <div className="relative rounded-2xl border border-border/50 backdrop-blur-sm p-8 space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Info className="w-5 h-5" />
                            <h2 className="text-xl font-medium">Study Overview</h2>
                        </div>
                        <div className="prose prose-sm max-w-none">
                            <p className="text-muted-foreground leading-relaxed">{explanation}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Guide */}
            <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                    <Lightbulb className="w-5 h-5" />
                    <h2 className="text-lg font-medium">How to Use This Study</h2>
                </div>
                <div className="grid gap-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                        <BookOpen className="w-4 h-4 mt-0.5 text-primary/70" />
                        <p>Each verse card shows the English text and original language (when available). Click the language icon to toggle between them.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <MessageSquare className="w-4 h-4 mt-0.5 text-primary/70" />
                        <p>Generate AI commentary for deeper insights into the verse's meaning, context, and application.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <Network className="w-4 h-4 mt-0.5 text-primary/70" />
                        <p>Explore cross-references to see how this verse connects with other parts of Scripture, including a visual timeline.</p>
                    </div>
                </div>
            </div>

            {/* Sequential Study */}
            <div className="relative space-y-8">
                {verses.map((verse, index) => {
                    const commentary = commentaries.find(c => c.verseRef === `${verse.bookName} ${verse.chapter}:${verse.verse}`);
                    const hasCommentary = !!commentary;
                    const isGenerating = isLoading === `${verse.bookName} ${verse.chapter}:${verse.verse}`;
                    const verseRef = `${verse.bookName} ${verse.chapter}:${verse.verse}`;
                    const verseCrossRefs = crossReferences?.filter(ref => ref.sourceReference === verseRef) || [];
                    const activeTab = activeVerseTab[index] || 'text';

                    return (
                        <div
                            key={verseRef}
                            className={cn(
                                "group relative rounded-2xl border border-border/50 transition-all duration-300",
                                "bg-card shadow-lg"
                            )}
                        >
                            {/* Verse Header */}
                            <div className="p-6 flex items-center justify-between border-b border-border/50">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                        hasCommentary ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                    )}>
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-medium text-foreground">{verseRef}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {verse.originalText && (
                                                <span className="inline-flex items-center gap-1 text-xs text-primary/70">
                                                    <Languages className="w-3 h-3" />
                                                    {verse.originalText.language === 'hebrew' ? 'Hebrew' : 'Greek'} available
                                                </span>
                                            )}
                                            {verseCrossRefs.length > 0 && (
                                                <span className="inline-flex items-center gap-1 text-xs text-primary/70">
                                                    <Network className="w-3 h-3" />
                                                    {verseCrossRefs.length} cross-references
                                                </span>
                                            )}
                                            {hasCommentary && (
                                                <span className="inline-flex items-center gap-1 text-xs text-primary/70">
                                                    <MessageSquare className="w-3 h-3" />
                                                    Commentary available
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {verse.originalText && (
                                        <button
                                            onClick={() => setShowOriginalText(prev => ({ ...prev, [index]: !prev[index] }))}
                                            className={cn(
                                                "p-2 rounded-lg transition-colors",
                                                showOriginalText[index] ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                            )}
                                            title={`Toggle ${verse.originalText.language} text`}
                                        >
                                            <Languages className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleCopyVerse(verse)}
                                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                                        title="Copy verse"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex items-center gap-1 px-6 pt-4">
                                <button
                                    onClick={() => setActiveVerseTab(prev => ({ ...prev, [index]: 'text' }))}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        activeTab === 'text'
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                    )}
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Text & Original
                                </button>

                                <button
                                    onClick={() => setActiveVerseTab(prev => ({ ...prev, [index]: 'commentary' }))}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        activeTab === 'commentary'
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                    )}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Commentary
                                    {hasCommentary && (
                                        <span className="w-2 h-2 rounded-full bg-primary/50" />
                                    )}
                                </button>

                                <button
                                    onClick={() => setActiveVerseTab(prev => ({ ...prev, [index]: 'references' }))}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        activeTab === 'references'
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                    )}
                                >
                                    <Network className="w-4 h-4" />
                                    Cross References
                                    {verseCrossRefs.length > 0 && (
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                            {verseCrossRefs.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === 'text' && (
                                    <div className="space-y-6">
                                        <div className="relative rounded-xl bg-muted/30 p-6">
                                            <p className="text-xl leading-relaxed">{verse.text}</p>
                                            {verse.originalText && showOriginalText[index] && (
                                                <div className="mt-6 pt-6 border-t border-border/50">
                                                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                                        <Languages className="w-4 h-4" />
                                                        <span>Original {verse.originalText.language} Text</span>
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "font-serif text-lg leading-relaxed p-4 rounded-lg bg-background/50",
                                                            verse.originalText.language === 'hebrew' ? "text-right" : "text-left"
                                                        )}
                                                        dir={verse.originalText.language === 'hebrew' ? 'rtl' : 'ltr'}
                                                    >
                                                        {verse.originalText.text}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {verse.originalText && (
                                                <button
                                                    onClick={() => setShowOriginalText(prev => ({ ...prev, [index]: !prev[index] }))}
                                                    className={cn(
                                                        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                                                        showOriginalText[index] ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                                    )}
                                                >
                                                    <Languages className="w-4 h-4" />
                                                    {showOriginalText[index] ? 'Hide Original' : 'Show Original'}
                                                </button>
                                            )}
                                            <a
                                                href={`https://biblehub.com/${verse.bookName.toLowerCase()}/${verse.chapter}-${verse.verse}.htm`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Study Tools
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'commentary' && (
                                    <div className="space-y-6">
                                        {hasCommentary ? (
                                            <div className="space-y-6">
                                                {commentary.commentary.sections.map((section, idx) => (
                                                    <div key={idx} className="space-y-2">
                                                        <h4 className="text-sm font-medium text-primary">
                                                            {section.title}
                                                        </h4>
                                                        <div className="prose prose-sm max-w-none">
                                                            <p className="text-muted-foreground leading-relaxed">
                                                                {renderContent(section.content)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => handleGenerateCommentary(verseRef)}
                                                    disabled={isGenerating}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                                                >
                                                    <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                                                    Regenerate Commentary
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                                <h3 className="text-lg font-medium mb-2">No Commentary Yet</h3>
                                                <p className="text-muted-foreground mb-6">
                                                    Generate AI-powered commentary to explore deeper insights into this verse.
                                                </p>
                                                <button
                                                    onClick={() => handleGenerateCommentary(verseRef)}
                                                    disabled={isGenerating}
                                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
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
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'references' && (
                                    <div className="space-y-6">
                                        {verseCrossRefs.length > 0 ? (
                                            <>
                                                {/* Timeline Section */}
                                                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                                                    <h5 className="text-sm font-medium text-primary/70">Biblical Timeline</h5>
                                                    <div className="max-w-3xl mx-auto">
                                                        <VerseTimeline
                                                            sourceReference={verseRef}
                                                            crossReferences={verseCrossRefs}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Cross References List */}
                                                <div className="space-y-4">
                                                    {verseCrossRefs.map((ref, idx) => (
                                                        <div key={idx} className="rounded-lg bg-muted/30 p-4 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-medium text-primary">{ref.reference}</h4>
                                                                <span className="text-xs text-muted-foreground">{ref.period}</span>
                                                            </div>
                                                            <p className="text-sm italic border-l-2 border-primary/20 pl-3">{ref.text}</p>
                                                            <p className="text-sm text-muted-foreground">{ref.connection}</p>
                                                            {ref.originalText && (
                                                                <div className="mt-3 pt-3 border-t border-border/50">
                                                                    <div className="text-xs text-muted-foreground mb-2">
                                                                        Original {ref.originalText.language}:
                                                                    </div>
                                                                    <div
                                                                        className={cn(
                                                                            "p-3 bg-background/50 rounded-lg font-serif text-sm",
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

                                                <button
                                                    onClick={() => handleGenerateCrossRefs(verse)}
                                                    disabled={generatingCrossRefs === verseRef}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                                                >
                                                    <RefreshCw className={cn("w-4 h-4", generatingCrossRefs === verseRef && "animate-spin")} />
                                                    Find More References
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Network className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                                <h3 className="text-lg font-medium mb-2">No Cross References Yet</h3>
                                                <p className="text-muted-foreground mb-6">
                                                    Find connections between this verse and other parts of Scripture.
                                                </p>
                                                <button
                                                    onClick={() => handleGenerateCrossRefs(verse)}
                                                    disabled={generatingCrossRefs === verseRef}
                                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
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
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 
