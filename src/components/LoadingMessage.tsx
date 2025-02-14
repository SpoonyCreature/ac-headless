import { Bot } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useEffect, useState } from 'react';

const loadingMessages = [
    "Reflecting on your question...",
    "Searching through my sources...",
    "Preparing a response...",
    "Adding the finishing touches..."
];

export function LoadingMessage() {


    return (
        <div className={cn(
            "group relative flex gap-3 px-4 py-4",
            "animate-in slide-in-from-bottom-2 duration-300 ease-out",
            "bg-background",
            "border-b border-border/5"
        )}>
            {/* Avatar */}
            <div className="flex h-6 w-6 shrink-0 select-none items-center justify-center">
                <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full",
                    "bg-muted animate-pulse"
                )}>
                    <Bot className="h-3 w-3 text-primary" />
                </div>
            </div>

            {/* Message Content */}
            <div className="flex flex-col gap-1 min-w-0 max-w-full flex-1">
                {/* Name and Time */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">
                        Assistant
                    </span>
                </div>

                {/* Loading Message */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground animate-pulse"></span>
                    <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-[bounce_1.4s_infinite]" style={{ animationDelay: '0.2s' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-[bounce_1.4s_infinite]" style={{ animationDelay: '0.4s' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-[bounce_1.4s_infinite]" style={{ animationDelay: '0.6s' }} />
                    </span>
                </div>
            </div>
        </div>
    );
} 
