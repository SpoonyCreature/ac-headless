import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Languages, Copy, Info, ExternalLink } from 'lucide-react';
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
}

interface BibleStudyResultsProps {
    results: {
        verses: BibleVerse[];
        crossReferences?: BibleVerse[];
        explanation?: string;
    };
}

export function BibleStudyResults({ results }: BibleStudyResultsProps) {
    const [activeVerse, setActiveVerse] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(true);
    const [showCrossReferences, setShowCrossReferences] = useState(true);

    const { verses, crossReferences, explanation } = results;

    const handleCopyVerse = (verse: BibleVerse) => {
        const text = `${verse.bookName} ${verse.chapter}:${verse.verse} - ${verse.text}`;
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    return (
        <div className="space-y-8">
            {/* Explanation Section - Quick Overview */}
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

            {/* Main Verses Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-medium flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Key Verses
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

                            {/* Verse Content */}
                            {activeVerse === index && (
                                <div className="border-t border-border">
                                    <div className="p-4 space-y-4">
                                        {/* English Text */}
                                        <p className="text-lg leading-relaxed">{verse.text}</p>

                                        {/* Original Language */}
                                        {verse.originalText && (
                                            <div className="mt-4 pt-4 border-t border-border">
                                                <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                                                    <Languages className="w-4 h-4" />
                                                    <span>
                                                        {verse.originalText.language === 'hebrew' ? 'Hebrew' : 'Greek'} Text
                                                    </span>
                                                </div>
                                                <p
                                                    className={cn(
                                                        "font-serif text-lg leading-relaxed p-3 bg-muted/50 rounded-lg",
                                                        verse.originalText.language === 'hebrew' ? "text-right" : "text-left"
                                                    )}
                                                    dir={verse.originalText.language === 'hebrew' ? 'rtl' : 'ltr'}
                                                >
                                                    {verse.originalText.text}
                                                </p>
                                            </div>
                                        )}

                                        {/* Study Tools */}
                                        <div className="flex items-center gap-2 pt-4 border-t border-border">
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
                            <svg
                                className="w-5 h-5 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                />
                            </svg>
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