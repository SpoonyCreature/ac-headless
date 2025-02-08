import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Languages, Copy, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { FormattedVerseText } from './FormattedVerseText';

interface BibleVerse {
    reference: string;
    verse: string;
    verses: Array<{
        verse: string;
        text: string;
    }>;
    originalText?: {
        reference: string;
        language: 'hebrew' | 'greek';
        verses?: Array<{
            verse: string;
            text: string;
        }>;
    };
}

interface BibleStudyResultsProps {
    results: {
        verses: BibleVerse[];
        crossReferences?: BibleVerse[];
        explanation?: string;
    };
    originalQuery: string;
}

export function BibleStudyResults({ results }: BibleStudyResultsProps) {
    const [activeVerse, setActiveVerse] = useState<number | null>(null);

    const { verses, crossReferences, explanation } = results;

    const handleCopyVerse = (verse: BibleVerse) => {
        const text = `${verse.reference} - ${verse.verses?.map(v => v.text).join(' ')}`;
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
                                        {verse.reference}
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
                                        <div className="relative rounded-xl bg-muted/30 p-4">
                                            <FormattedVerseText
                                                verses={verse.verses}
                                            />
                                        </div>


                                        {/* Study Tools */}
                                        <div className="flex items-center gap-2 pt-4 border-t border-border">
                                            <a
                                                href={`https://biblehub.com/${verse.reference.toLowerCase()}.htm`}
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