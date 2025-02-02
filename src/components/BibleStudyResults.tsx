import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface BibleVerse {
    bookName: string;
    chapter: string;
    verse: string;
    text: string;
}

interface BibleStudyResultsProps {
    results: {
        verses: BibleVerse[];
        crossReferences?: BibleVerse[];
        explanation?: string;
    };
}

export function BibleStudyResults({ results }: BibleStudyResultsProps) {
    const [showExplanation, setShowExplanation] = useState(true);
    const [showVerses, setShowVerses] = useState(true);
    const [showCrossReferences, setShowCrossReferences] = useState(true);

    const { verses, crossReferences, explanation } = results;

    return (
        <div className="space-y-8">
            {/* Explanation Section */}
            {explanation && (
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
                    <button
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                        <h2 className="text-lg font-medium">Study Overview</h2>
                        {showExplanation ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                    </button>
                    {showExplanation && (
                        <div className="px-6 py-4 border-t border-border prose prose-sm max-w-none">
                            <p>{explanation}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Main Verses Section */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
                <button
                    onClick={() => setShowVerses(!showVerses)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                    <h2 className="text-lg font-medium">Key Verses</h2>
                    {showVerses ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                </button>
                {showVerses && (
                    <div className="px-6 py-4 border-t border-border space-y-4">
                        {verses.map((verse, index) => (
                            <div key={index} className="flex gap-4">
                                <BookOpen className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                                <div>
                                    <p className="font-medium text-sm text-muted-foreground mb-1">
                                        {verse.bookName} {verse.chapter}:{verse.verse}
                                    </p>
                                    <p className="text-foreground">{verse.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cross References Section */}
            {crossReferences && crossReferences.length > 0 && (
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
                    <button
                        onClick={() => setShowCrossReferences(!showCrossReferences)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                        <h2 className="text-lg font-medium">Cross References</h2>
                        {showCrossReferences ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                    </button>
                    {showCrossReferences && (
                        <div className="px-6 py-4 border-t border-border space-y-4">
                            {crossReferences.map((verse, index) => (
                                <div key={index} className="flex gap-4">
                                    <BookOpen className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                                    <div>
                                        <p className="font-medium text-sm text-muted-foreground mb-1">
                                            {verse.bookName} {verse.chapter}:{verse.verse}
                                        </p>
                                        <p className="text-foreground">{verse.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 