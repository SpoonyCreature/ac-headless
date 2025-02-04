import { ChatMessage as ChatMessageType } from '@/src/types/chat';
import { User, Bot } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div className={cn(
            "group relative flex gap-3 px-4 py-3",
            isUser ? "flex-row-reverse" : "flex-row"
        )}>
            {/* Avatar */}
            <div className="flex-shrink-0 mt-1">
                {isUser ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 ring-4 ring-primary/10 flex items-center justify-center text-primary-foreground shadow-lg">
                        <User className="w-4 h-4" />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 ring-4 ring-background flex items-center justify-center shadow-lg">
                        <Bot className="w-4 h-4 text-primary" />
                    </div>
                )}
            </div>

            {/* Message Content */}
            <div className={cn(
                "flex flex-col gap-1 max-w-[85%] md:max-w-[75%]",
                isUser ? "items-end" : "items-start"
            )}>
                {/* Name and Time */}
                <div className={cn(
                    "flex gap-2 items-center text-xs",
                    isUser ? "flex-row-reverse" : "flex-row"
                )}>
                    <span className="font-medium text-foreground/80">
                        {isUser ? 'You' : 'Assistant'}
                    </span>
                    <span className="text-muted-foreground/50">
                        {message.time}
                    </span>
                </div>

                {/* Message Bubble */}
                <div className={cn(
                    "rounded-2xl px-4 py-2 shadow-sm",
                    isUser ?
                        "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground" :
                        "bg-gradient-to-br from-muted/80 to-muted border border-border/50 text-foreground"
                )}>
                    <div className={cn(
                        "prose prose-sm max-w-none",
                        isUser ? "prose-invert" : ""
                    )}>
                        {message.text}
                    </div>
                </div>
            </div>
        </div>
    );
} 