import { ChatMessage as ChatMessageType } from '@/src/types/chat';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`group relative flex gap-4 p-6 transition-colors ${isUser ? 'bg-muted/30' : 'bg-background hover:bg-muted/10'}`}>
            <div className="flex-shrink-0">
                {isUser ? (
                    <div className="w-9 h-9 rounded-full bg-primary/10 ring-1 ring-primary/25 flex items-center justify-center text-primary shadow-sm">
                        <User className="w-5 h-5" />
                    </div>
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/25 flex items-center justify-center shadow-sm">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                )}
            </div>
            <div className="flex-1 space-y-2.5 min-w-0">
                <div className="flex justify-between items-center">
                    <div className="font-medium text-sm text-foreground/90">
                        {isUser ? 'You' : 'Assistant'}
                    </div>
                    <div className="text-[11px] font-medium text-muted-foreground/60">
                        {message.time}
                    </div>
                </div>
                <div className={`prose prose-sm max-w-none ${isUser ? 'text-foreground/90' : 'text-foreground'}`}>
                    {message.text}
                </div>
            </div>
            <div className="absolute left-0 w-1 top-0 bottom-0 transition-opacity opacity-0 group-hover:opacity-100">
                <div className={`w-full h-full ${isUser ? 'bg-primary/20' : 'bg-primary/30'}`} />
            </div>
        </div>
    );
} 