import { cn } from '@/src/lib/utils';

interface FormattedVerseTextProps {
    className?: string;
    verses?: Array<{
        verse: string;
        text: string;
    }>;
}

export function FormattedVerseText({ verses, className }: FormattedVerseTextProps) {
    // If verses array is provided, use that for structured rendering

    if (verses?.length) {
        return (
            <div className={cn("space-y-2", className)}>
                {verses.map((v, index) => (
                    <div key={index} className="flex gap-2">
                        <span className="text-primary font-medium text-sm mt-1 shrink-0">
                            {v.verse}
                        </span>
                        <p className="text-lg sm:text-xl leading-relaxed">
                            {formatVerseText(v.text.trim())}
                        </p>
                    </div>
                ))}
            </div>
        );
    }
}

// Helper function to format verse text with footnotes
function formatVerseText(text: string) {
    return text.split(/\/f[^*]/).map((part, index) => {
        if (index === 0) {
            // First part before any footnote
            return part;
        }

        // For subsequent parts, they'll start with the footnote content
        const [footnote, ...rest] = part.split('/f*');
        return (
            <>
                <span className="text-muted-foreground text-sm italic">
                    {' '}{footnote}{' '}
                </span>
                {rest.join('')}
            </>
        );
    });
} 
