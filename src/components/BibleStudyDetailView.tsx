import { useState } from 'react';
import { ChevronDown, BookOpen, Languages, Copy, Info, ExternalLink, MessageSquare, Network, Lightbulb, History } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface BibleVerse {
    bookName: string;
    chapter: string;
    verse: string;
    text: string;
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
    historicalContext?: {
        period: string;
        culturalNotes: string[];
        historicalEvents: Array<{
            date: string;
            event: string;
            significance: string;
        }>;
    };
    theologicalContext?: {
        covenant: string;
        themes: string[];
        doctrines: string[];
        biblicalNarrative: {
            book: {
                overview: string;
                purpose: string;
                author: string;
                date: string;
                audience: string;
            };
            chapter: {
                summary: string;
                mainPoints: string[];
                narrative: string;
            };
            testament: {
                context: string;
                progression: string;
            };
        };
    };
    linguisticContext?: {
        wordStudies: Array<{
            original: string;
            transliteration: string;
            meanings: string[];
            usageInScripture: Array<{
                reference: string;
                context: string;
            }>;
        }>;
        literaryDevices: string[];
        genre: string;
        parallelPassages: Array<{
            reference: string;
            text: string;
            connection: string;
        }>;
    };
    applicationContext?: {
        timelessPrinciples: string[];
        contemporaryImplications: string[];
        practicalSteps: string[];
    };
    crossReferences?: Array<{
        reference: string;
        text: string;
        bookName: string;
        chapter: string;
        verse: string;
        period?: string; // Historical period for timeline placement
        connection: string;
        theme?: string;
        testament: 'old' | 'new';
        year?: number; // Approximate year for timeline
    }>;
}

interface BibleStudyDetailProps {
    study: {
        verses: BibleVerse[];
        crossReferences?: BibleVerse[];
        explanation?: string;
    };
    onGenerateCommentary?: (verse: BibleVerse) => Promise<void>;
    onGenerateInsights?: (verse: BibleVerse) => Promise<void>;
    onGenerateCrossReferenceMap?: (verse: BibleVerse) => Promise<void>;
    onGenerateHistoricalContext?: (verse: BibleVerse) => Promise<void>;
    onGenerateTheologicalContext?: (verse: BibleVerse) => Promise<void>;
    onGenerateLinguisticContext?: (verse: BibleVerse) => Promise<void>;
    onGenerateApplicationContext?: (verse: BibleVerse) => Promise<void>;
}

export function BibleStudyDetailView({ study, onGenerateCommentary, onGenerateInsights, onGenerateCrossReferenceMap, onGenerateHistoricalContext, onGenerateTheologicalContext, onGenerateLinguisticContext, onGenerateApplicationContext }: BibleStudyDetailProps) {
    const [activeVerse, setActiveVerse] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'verse' | 'commentary' | 'insights' | 'cross-references' | 'historical' | 'theological' | 'application'>('verse');
    const [showCrossReferences, setShowCrossReferences] = useState(true);
    const [showOriginalText, setShowOriginalText] = useState<Record<number, boolean>>({});

    const { verses, crossReferences, explanation } = study;

    const handleCopyVerse = (verse: BibleVerse) => {
        const text = `${verse.bookName} ${verse.chapter}:${verse.verse} - ${verse.text}`;
        navigator.clipboard.writeText(text);
        // TODO: Add toast notification
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
                                            onClick={() => setActiveTab('historical')}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                                activeTab === 'historical'
                                                    ? "border-primary text-primary"
                                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <History className="w-4 h-4" />
                                            Historical
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('theological')}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                                activeTab === 'theological'
                                                    ? "border-primary text-primary"
                                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            Theological
                                        </button>

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

                                        <button
                                            onClick={() => setActiveTab('application')}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                                activeTab === 'application'
                                                    ? "border-primary text-primary"
                                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <Lightbulb className="w-4 h-4" />
                                            Application
                                        </button>

                                        {/* ... existing tabs ... */}
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

                                        {activeTab === 'insights' && (
                                            <div className="space-y-4">
                                                {verse.aiInsights ? (
                                                    verse.aiInsights.map((insight, i) => (
                                                        <div key={i} className="p-3 bg-primary/5 rounded-lg">
                                                            <p className="text-sm leading-relaxed">{insight}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                        <p className="text-muted-foreground">No AI insights available yet</p>
                                                        {onGenerateInsights && (
                                                            <button
                                                                onClick={() => onGenerateInsights(verse)}
                                                                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                                                            >
                                                                Generate Insights
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'cross-references' && (
                                            <div className="space-y-6">
                                                {verse.crossReferences && verse.crossReferences.length > 0 ? (
                                                    <>
                                                        {/* Timeline Visualization */}
                                                        <div className="relative">
                                                            <h3 className="text-lg font-medium mb-4">Biblical Timeline</h3>
                                                            <div className="h-[200px] relative">
                                                                {/* Timeline Base */}
                                                                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border" />

                                                                {/* Timeline Markers */}
                                                                <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center">
                                                                    {verse.crossReferences.map((ref, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className="absolute"
                                                                            style={{
                                                                                left: `${(ref.year ? (ref.year + 2000) / 4000 * 100 : i / verse.crossReferences!.length * 100)}%`,
                                                                                transform: 'translateX(-50%)'
                                                                            }}
                                                                        >
                                                                            <div className={cn(
                                                                                "p-2 rounded-lg text-xs font-medium shadow-sm transition-all hover:scale-105",
                                                                                ref.testament === 'old' ? "bg-amber-100" : "bg-blue-100"
                                                                            )}>
                                                                                <p className="whitespace-nowrap">{ref.reference}</p>
                                                                                <p className="text-muted-foreground text-[10px]">{ref.period}</p>
                                                                            </div>
                                                                            <div className="w-px h-3 bg-border mx-auto mt-1" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Thematic Grouping */}
                                                        <div>
                                                            <h3 className="text-lg font-medium mb-4">Thematic Connections</h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {Object.entries(
                                                                    verse.crossReferences.reduce((acc, ref) => {
                                                                        const theme = ref.theme || 'Other';
                                                                        if (!acc[theme]) acc[theme] = [];
                                                                        acc[theme].push(ref);
                                                                        return acc;
                                                                    }, {} as Record<string, typeof verse.crossReferences>)
                                                                ).map(([theme, refs]) => (
                                                                    <div key={theme} className="p-4 rounded-lg bg-muted/30">
                                                                        <h4 className="font-medium text-primary mb-3">{theme}</h4>
                                                                        <div className="space-y-3">
                                                                            {refs?.map((ref, i) => (
                                                                                <div key={i} className="space-y-1">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className="font-medium">{ref.reference}</span>
                                                                                        <span className="text-xs text-muted-foreground">{ref.testament === 'old' ? 'OT' : 'NT'}</span>
                                                                                    </div>
                                                                                    <p className="text-sm text-muted-foreground">{ref.text}</p>
                                                                                    <p className="text-xs text-primary/80 mt-1">{ref.connection}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Connection Graph */}
                                                        <div>
                                                            <h3 className="text-lg font-medium mb-4">Scripture Web</h3>
                                                            <div className="aspect-video bg-muted/30 rounded-lg p-4">
                                                                {/* TODO: Add D3 or similar visualization showing interconnections */}
                                                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                                                    <p>Interactive connection graph coming soon</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <Network className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                        <p className="text-muted-foreground">No cross references available yet</p>
                                                        {onGenerateCrossReferenceMap && (
                                                            <button
                                                                onClick={() => onGenerateCrossReferenceMap(verse)}
                                                                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                                                            >
                                                                Generate Cross References
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'historical' && (
                                            <div className="space-y-4">
                                                {verse.historicalContext ? (
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Historical Period</h3>
                                                            <p className="text-muted-foreground">{verse.historicalContext.period}</p>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Cultural Context</h3>
                                                            <ul className="space-y-2">
                                                                {verse.historicalContext.culturalNotes.map((note, i) => (
                                                                    <li key={i} className="text-muted-foreground">{note}</li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Key Historical Events</h3>
                                                            <div className="space-y-3">
                                                                {verse.historicalContext.historicalEvents.map((event, i) => (
                                                                    <div key={i} className="p-3 bg-muted/30 rounded-lg">
                                                                        <p className="font-medium">{event.date}</p>
                                                                        <p className="text-sm text-muted-foreground">{event.event}</p>
                                                                        <p className="text-sm mt-2">{event.significance}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <History className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                        <p className="text-muted-foreground">No historical context available yet</p>
                                                        {onGenerateHistoricalContext && (
                                                            <button
                                                                onClick={() => onGenerateHistoricalContext(verse)}
                                                                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                                                            >
                                                                Generate Historical Context
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'theological' && (
                                            <div className="space-y-4">
                                                {verse.theologicalContext ? (
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Covenant</h3>
                                                            <p className="text-muted-foreground">{verse.theologicalContext.covenant}</p>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Theological Themes</h3>
                                                            <ul className="space-y-2">
                                                                {verse.theologicalContext.themes.map((theme, i) => (
                                                                    <li key={i} className="text-muted-foreground">{theme}</li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Biblical Narrative</h3>
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <h4 className="text-md font-medium mb-1">Book Overview</h4>
                                                                    <p className="text-muted-foreground">{verse.theologicalContext.biblicalNarrative.book.overview}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-md font-medium mb-1">Book Purpose</h4>
                                                                    <p className="text-muted-foreground">{verse.theologicalContext.biblicalNarrative.book.purpose}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-md font-medium mb-1">Book Author</h4>
                                                                    <p className="text-muted-foreground">{verse.theologicalContext.biblicalNarrative.book.author}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-md font-medium mb-1">Book Date</h4>
                                                                    <p className="text-muted-foreground">{verse.theologicalContext.biblicalNarrative.book.date}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-md font-medium mb-1">Book Audience</h4>
                                                                    <p className="text-muted-foreground">{verse.theologicalContext.biblicalNarrative.book.audience}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Chapter Summary</h3>
                                                            <p className="text-muted-foreground">{verse.theologicalContext.biblicalNarrative.chapter.summary}</p>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Main Points</h3>
                                                            <ul className="space-y-2">
                                                                {verse.theologicalContext.biblicalNarrative.chapter.mainPoints.map((point, i) => (
                                                                    <li key={i} className="text-muted-foreground">{point}</li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Narrative</h3>
                                                            <p className="text-muted-foreground">{verse.theologicalContext.biblicalNarrative.chapter.narrative}</p>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Testament Context</h3>
                                                            <p className="text-muted-foreground">{verse.theologicalContext.biblicalNarrative.testament.context}</p>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Testament Progression</h3>
                                                            <p className="text-muted-foreground">{verse.theologicalContext.biblicalNarrative.testament.progression}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                        <p className="text-muted-foreground">No theological context available yet</p>
                                                        {onGenerateTheologicalContext && (
                                                            <button
                                                                onClick={() => onGenerateTheologicalContext(verse)}
                                                                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                                                            >
                                                                Generate Theological Context
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'application' && (
                                            <div className="space-y-4">
                                                {verse.applicationContext ? (
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Timeless Principles</h3>
                                                            <p className="text-muted-foreground">{verse.applicationContext.timelessPrinciples.join(', ')}</p>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Contemporary Implications</h3>
                                                            <p className="text-muted-foreground">{verse.applicationContext.contemporaryImplications.join(', ')}</p>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-medium mb-2">Practical Steps</h3>
                                                            <p className="text-muted-foreground">{verse.applicationContext.practicalSteps.join(', ')}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                        <p className="text-muted-foreground">No application context available yet</p>
                                                        {onGenerateApplicationContext && (
                                                            <button
                                                                onClick={() => onGenerateApplicationContext(verse)}
                                                                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                                                            >
                                                                Generate Application Context
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
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

            {/* Cross References Section */}
            {crossReferences && crossReferences.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                    <button
                        onClick={() => setShowCrossReferences(!showCrossReferences)}
                        className="flex items-center justify-between w-full text-left"
                    >
                        <h2 className="text-xl font-medium flex items-center gap-2">
                            <Network className="w-5 h-5 text-primary" />
                            Cross References
                        </h2>
                        <ChevronDown className={cn(
                            "w-5 h-5 text-muted-foreground transition-transform",
                            showCrossReferences && "rotate-180"
                        )} />
                    </button>

                    {showCrossReferences && (
                        <div className="grid gap-3 pl-4 border-l-2 border-primary/20">
                            {crossReferences.map((verse, index) => (
                                <div key={index} className="space-y-1">
                                    <p className="font-medium text-primary">
                                        {verse.bookName} {verse.chapter}:{verse.verse}
                                    </p>
                                    <p className="text-muted-foreground">{verse.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 
