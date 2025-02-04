import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

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
    const [showExplanation, setShowExplanation] = useState(true);
    const [showVerses, setShowVerses] = useState(true);
    const [showCrossReferences, setShowCrossReferences] = useState(true);

    const { verses, crossReferences, explanation } = results;

    return (
        <div className="space-y-12">
            {/* Main Verses */}
            <div className="space-y-6">
                <h2 className="text-2xl font-medium">Key Verses</h2>
                <div className="space-y-6">
                    {verses.map((verse, index) => (
                        <div key={index} className="space-y-3">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-medium">
                                    {verse.bookName} {verse.chapter}:{verse.verse}
                                </h3>
                                <p className="text-lg leading-relaxed">{verse.text}</p>
                                {verse.originalText && (
                                    <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-medium">
                                                {verse.originalText.language === 'hebrew' ? 'Hebrew' : 'Greek'} Text
                                            </span>
                                        </div>
                                        <p className="font-serif text-lg leading-relaxed" dir={verse.originalText.language === 'hebrew' ? 'rtl' : 'ltr'}>
                                            {verse.originalText.text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cross References */}
            {crossReferences && crossReferences.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-medium">Cross References</h2>
                    <div className="space-y-6">
                        {crossReferences.map((verse, index) => (
                            <div key={index} className="space-y-2">
                                <h3 className="text-lg font-medium">
                                    {verse.bookName} {verse.chapter}:{verse.verse}
                                </h3>
                                <p className="text-lg leading-relaxed">{verse.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Explanation */}
            {explanation && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-medium">Study Notes</h2>
                    <div className="prose prose-lg max-w-none">
                        <p>{explanation}</p>
                    </div>
                </div>
            )}
        </div>
    );
} 