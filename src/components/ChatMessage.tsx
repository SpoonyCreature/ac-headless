import { ChatMessage as ChatMessageType } from '@/src/types/chat';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-4 p-4 ${isUser ? 'bg-muted/50' : 'bg-background'}`}>
            <div className="flex-shrink-0">
                {isUser ? (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <User className="w-5 h-5" />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="w-5 h-5" />
                    </div>
                )}
            </div>
            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                    <div className="font-medium">
                        {isUser ? 'You' : 'Assistant'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {message.time}
                    </div>
                </div>
                <div className="prose prose-sm max-w-none">
                    {message.text}
                </div>
            </div>
        </div>
    );
} 