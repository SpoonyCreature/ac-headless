export interface Source {
    id: string;
    title: string;
    uri: string;
    text: string;
}

export interface GroundingSegment {
    startIndex: number;
    endIndex: number;
    text: string;
}

export interface GroundingSupport {
    segment: GroundingSegment;
    groundingChunkIndices: number[];
    confidenceScores: number[];
}

export interface ChatMessage {
    _id: string;
    role: 'user' | 'Agent';
    text: string;
    time: string;
    sources?: Source[];
    groundingSupports?: GroundingSupport[];
    public?: boolean;
}

export interface Chat {
    _id?: string;
    question: string;
    public: boolean;
    rating?: number;
    thread: ChatMessage[];
    _owner?: string;
    _createdDate?: Date;
    _updatedDate?: Date;
} 
