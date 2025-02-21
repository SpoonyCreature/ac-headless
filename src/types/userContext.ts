export interface UserContextNote {
    timestamp: string;
    content: string;
    type: string;
    tags?: string[];
}

export interface BibleCoverage {
    book: string;
    chaptersRead: number[];
    lastStudied: string;
}

export interface UserContext {
    _id: string;
    _owner: string;
    notes: UserContextNote[];
    bibleCoverage: BibleCoverage[];
    lastActivity: string;
    studyStreak: number;
    lastStudyDate: string;
} 