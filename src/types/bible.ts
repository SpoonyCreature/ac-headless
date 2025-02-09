export interface CrossReference {
    reference: string;
    connection: string;
    period: string;
    text: string;
    sourceReference: string;
    originalText?: {
        reference: string;
        text: string;
        language: 'hebrew' | 'greek';
        verses?: Array<{
            verse: string;
            text: string;
        }>;
    };
}

export interface BibleVerse {
    reference: string;
    verses: Array<{
        verse: string;
        text: string;
    }>;
    originalText?: {
        reference: string;
        text: string;
        language: 'hebrew' | 'greek';
        verses?: Array<{
            verse: string;
            text: string;
        }>;
    };
    commentary?: string[];
    aiInsights?: string[];
    crossReferenceMap?: {
        reference: string;
        connection: string;
        period: string;
        theme?: string;
        testament?: string;
        narrative_order?: number;
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
}

export interface BibleStudy {
    _id: string;
    query: string;
    translation: string;
    verses: BibleVerse[];
    crossReferences?: CrossReference[];
    explanation?: string;
    notes?: string[];
    comments?: string[];
    commentaries?: Array<{
        verseRef: string;
        commentary: {
            markdown: string;
        };
        timestamp: number;
    }>;
    _owner?: string;
    _createdDate?: string;
    public?: boolean;
} 
