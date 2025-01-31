export interface ChatMessage {
    _id: string;
    role: 'user' | 'Agent';
    text: string;
    time: string;
    question?: string;
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
