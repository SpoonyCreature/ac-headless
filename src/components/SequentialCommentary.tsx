import { useState } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import ReactMarkdown from 'react-markdown';

interface CommentaryResponse {
    markdown: string;
}

interface Commentary {
    verseRef: string;
    commentary: CommentaryResponse;
    timestamp: number;
}

interface SequentialCommentaryProps {
    verses: {
        reference: string;
        text: string;
    }[];
    onGenerateCommentary: (verseRef: string, previousCommentaries: Commentary[]) => Promise<CommentaryResponse>;
}

export function SequentialCommentary({
    verses,
    onGenerateCommentary
}: SequentialCommentaryProps) {
    const [commentaries, setCommentaries] = useState<Commentary[]>([]);
    const [isLoading, setIsLoading] = useState<string | null>(null); // Stores the verse ref being loaded

    const handleGenerateCommentary = async (verseRef: string) => {
        if (isLoading) return;

        setIsLoading(verseRef);
        let newCommentary: CommentaryResponse | null = null;

        try {
            // Get previous commentaries up to this verse's position
            const verseIndex = verses.findIndex(v => v.reference === verseRef);
            const previousVerses = verses.slice(0, verseIndex);
            const relevantCommentaries = commentaries
                .filter(c => previousVerses.some(v => v.reference === c.verseRef))
                .sort((a, b) => a.timestamp - b.timestamp);

            newCommentary = await onGenerateCommentary(verseRef, relevantCommentaries);

            // Validate the response has the expected structure
            if (!newCommentary?.markdown) {
                console.error('Invalid commentary format received:', newCommentary);
                throw new Error('Invalid commentary response format');
            }

            // At this point newCommentary is guaranteed to be a valid CommentaryResponse
            const validCommentary: CommentaryResponse = newCommentary;

            // Remove any existing commentary for this verse and add the new one
            setCommentaries(prev => [
                ...prev.filter(c => c.verseRef !== verseRef),
                {
                    verseRef,
                    commentary: validCommentary,
                    timestamp: Date.now()
                }
            ]);
        } catch (error) {
            console.error('Failed to generate commentary:', error);
            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    commentary: newCommentary
                });
            }
        } finally {
            setIsLoading(null);
        }
    };

    const regenerateCommentary = async (verseRef: string) => {
        // Remove the existing commentary for this verse
        setCommentaries(prev => prev.filter(c => c.verseRef !== verseRef));
        // Generate a new one
        await handleGenerateCommentary(verseRef);
    };

    return (
        <div className="relative space-y-6">
            {/* Progress Line */}
            <div className="absolute left-[15px] top-[28px] bottom-4 w-[2px] bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />

            {verses.map((verse, index) => {
                const commentary = commentaries.find(c => c.verseRef === verse.reference);
                const hasCommentary = !!commentary;
                const isGenerating = isLoading === verse.reference;

                return (
                    <div key={verse.reference} className="relative pl-8">
                        {/* Verse marker */}
                        <div className={cn(
                            "absolute left-0 top-2 w-8 h-8 rounded-full border-2 transition-colors duration-200",
                            hasCommentary ? "border-primary bg-primary/5" : "border-primary/20 bg-background",
                            isGenerating && "animate-pulse"
                        )}>
                            <div className="absolute inset-1 rounded-full bg-gradient-to-b from-primary/10 to-transparent" />
                            <div className={cn(
                                "absolute inset-2 rounded-full transition-colors duration-200",
                                hasCommentary ? "bg-primary" : "bg-primary/20"
                            )} />
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-lg text-foreground">{verse.reference}</h3>
                                <button
                                    onClick={() => hasCommentary ?
                                        regenerateCommentary(verse.reference) :
                                        handleGenerateCommentary(verse.reference)
                                    }
                                    disabled={isGenerating}
                                    className={cn(
                                        "p-2 rounded-lg transition-all duration-200",
                                        hasCommentary ? "text-primary hover:bg-primary/5" : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                    title={hasCommentary ? "Regenerate commentary" : "Generate commentary"}
                                >
                                    {isGenerating ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Lightbulb className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Verse Text */}
                            <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                                {verse.text}
                            </div>

                            {/* Commentary */}
                            {commentary && (
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/10 rounded-full" />
                                    <div className="pl-4 prose prose-sm max-w-none prose-headings:text-primary prose-headings:font-medium prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-em:text-primary/80 prose-em:font-serif">
                                        <ReactMarkdown>
                                            {commentary.commentary.markdown}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
} 
