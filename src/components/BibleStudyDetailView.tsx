import { useState } from 'react';
import { ChevronDown, BookOpen, Languages, Copy, Info, ExternalLink, MessageSquare, Network, Lightbulb, History } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { BibleVerse, BibleStudy, CrossReference } from '@/src/types/bible';

interface BibleStudyDetailProps {
    study: BibleStudy;
    onGenerateCommentary?: (verse: BibleVerse) => Promise<void>;
    onGenerateCrossReferenceMap?: (verse: BibleVerse) => Promise<void>;
}

export function BibleStudyDetailView({ study, onGenerateCommentary, onGenerateCrossReferenceMap, }: BibleStudyDetailProps) {
    const [activeVerse, setActiveVerse] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'verse' | 'commentary' | 'cross-references'>('verse');
    const [showCrossReferences, setShowCrossReferences] = useState(true);
    const [showOriginalText, setShowOriginalText] = useState<Record<number, boolean>>({});
    const [generatingCrossRefs, setGeneratingCrossRefs] = useState<string | null>(null);

    const { verses = [], crossReferences, explanation } = study;

    const handleCopyVerse = (verse: BibleVerse) => {
        const text = `${verse.bookName} ${verse.chapter}:${verse.verse} - ${verse.text}`;
        navigator.clipboard.writeText(text);
        // TODO: Add toast notification
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

    return (
        <div className="space-y-8">
            {/* Study Overview Card */}
            {explanation && (
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Info className="w-5 h-5" />
                        <h2 className="text-lg font-medium">Study Overview</h2>
                    </div>
                    <div className="prose prose-sm max-w-none">
                        <p>{explanation}</p>
                    </div>
                </div>
            )}

            {/* Interactive Verse Study Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-medium flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Interactive Study
                </h2>
                <div className="grid gap-4">
                    {verses.map((verse, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group border border-border rounded-xl overflow-hidden transition-all duration-200",
                                activeVerse === index ? "bg-muted/50" : "hover:bg-muted/30"
                            )}
                        >
                            {/* Verse Header */}
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer"
                                onClick={() => setActiveVerse(activeVerse === index ? null : index)}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-medium text-primary">
                                        {verse.bookName} {verse.chapter}:{verse.verse}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {verse.originalText && (
                                        <Languages
                                            className={cn(
                                                "w-4 h-4 transition-colors",
                                                activeVerse === index ? "text-primary" : "text-muted-foreground"
                                            )}
                                        />
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyVerse(verse);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
                                        title="Copy verse"
                                    >
                                        <Copy className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <ChevronDown
                                        className={cn(
                                            "w-4 h-4 text-muted-foreground transition-transform",
                                            activeVerse === index && "rotate-180"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Expanded Verse Content */}
                            {activeVerse === index && (
                                <div className="border-t border-border">
                                    {/* Enhanced Tab Navigation */}
                                    <div className="flex flex-wrap border-b border-border">
                                        {/* Existing tabs */}
                                        <button
                                            onClick={() => setActiveTab('verse')}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                                activeTab === 'verse'
                                                    ? "border-primary text-primary"
                                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            Text
                                        </button>

                                        {/* New Context Tabs */}
                                        <button
                                            onClick={() => setActiveTab('cross-references')}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                                activeTab === 'cross-references'
                                                    ? "border-primary text-primary"
                                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <Network className="w-4 h-4" />
                                            Cross References
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-4">
                                        {activeTab === 'verse' && (
                                            <div className="space-y-4">
                                                {/* Main English Text */}
                                                <div className="p-6 bg-card rounded-lg border border-border">
                                                    <p className="text-xl leading-relaxed">{verse.text}</p>

                                                    {/* Original Text Footnote */}
                                                    {verse.originalText && (
                                                        <div className="mt-4 pt-4 border-t border-border/50">
                                                            <button
                                                                onClick={() => setShowOriginalText(prev => ({ ...prev, [index]: !prev[index] }))}
                                                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                                            >
                                                                <Languages className="w-4 h-4" />
                                                                <span>
                                                                    View {verse.originalText.language === 'hebrew' ? 'Hebrew' : 'Greek'} Text
                                                                </span>
                                                                <ChevronDown
                                                                    className={cn(
                                                                        "w-4 h-4 transition-transform",
                                                                        showOriginalText[index] && "rotate-180"
                                                                    )}
                                                                />
                                                            </button>

                                                            {showOriginalText[index] && (
                                                                <div className="mt-3 space-y-2">
                                                                    <div
                                                                        className={cn(
                                                                            "p-3 bg-muted/30 rounded-lg font-serif",
                                                                            verse.originalText.language === 'hebrew' ? "text-right" : "text-left"
                                                                        )}
                                                                        dir={verse.originalText.language === 'hebrew' ? 'rtl' : 'ltr'}
                                                                    >
                                                                        <p className="text-lg leading-relaxed">{verse.originalText.text}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                        <Info className="w-3 h-3" />
                                                                        <span>Original text from {verse.originalText.reference}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'commentary' && (
                                            <div className="space-y-4">
                                                {verse.commentary ? (
                                                    verse.commentary.map((comment, i) => (
                                                        <div key={i} className="p-3 bg-muted/30 rounded-lg">
                                                            <p className="text-sm leading-relaxed">{comment}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                        <p className="text-muted-foreground">No commentary available yet</p>
                                                        {onGenerateCommentary && (
                                                            <button
                                                                onClick={() => onGenerateCommentary(verse)}
                                                                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                                                            >
                                                                Generate Commentary
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'cross-references' && (
                                            <div className="space-y-6">
                                                {(() => {
                                                    const currentVerse = verses[activeVerse];
                                                    const currentVerseRef = `${currentVerse.bookName} ${currentVerse.chapter}:${currentVerse.verse}`;
                                                    const relevantCrossRefs = (study.crossReferences || []).filter(
                                                        (ref: CrossReference) => ref.sourceReference === currentVerseRef
                                                    );

                                                    if (relevantCrossRefs.length === 0) {
                                                        return (
                                                            <div className="text-center py-8">
                                                                <Network className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                                <p className="text-muted-foreground">No cross references available yet</p>
                                                                {onGenerateCrossReferenceMap && (
                                                                    <button
                                                                        onClick={() => handleGenerateCrossRefs(currentVerse)}
                                                                        disabled={generatingCrossRefs === currentVerseRef}
                                                                        className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {generatingCrossRefs === currentVerseRef ? (
                                                                            <>
                                                                                <Network className="w-4 h-4 animate-spin inline mr-2" />
                                                                                Generating Cross References...
                                                                            </>
                                                                        ) : (
                                                                            'Generate Cross References'
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div className="space-y-6">
                                                            {relevantCrossRefs.map((ref: CrossReference, index: number) => (
                                                                <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-3">
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className="font-medium text-primary">{ref.reference}</h4>
                                                                        <span className="text-xs text-muted-foreground">{ref.period}</span>
                                                                    </div>
                                                                    <p className="text-sm italic border-l-2 border-primary/20 pl-3">{ref.text}</p>
                                                                    <p className="text-sm text-muted-foreground">{ref.connection}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}


                                        {/* Study Tools */}
                                        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border">
                                            <a
                                                href={`https://biblehub.com/${verse.bookName.toLowerCase()}/${verse.chapter}-${verse.verse}.htm`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                View on BibleHub
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 
