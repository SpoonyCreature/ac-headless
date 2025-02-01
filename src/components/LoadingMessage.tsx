import { Bot } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function LoadingMessage() {
    return (
        <div className="group relative flex gap-3 px-4 py-3">
            {/* Avatar */}
            <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 ring-4 ring-background flex items-center justify-center shadow-lg">
                    <Bot className="w-4 h-4 text-primary" />
                </div>
            </div>

            {/* Message Content */}
            <div className="flex flex-col gap-1 max-w-[85%] md:max-w-[75%]">
                {/* Name and Time */}
                <div className="flex gap-2 items-center text-xs">
                    <span className="font-medium text-foreground/80">
                        Assistant
                    </span>
                    <span className="text-muted-foreground/50">
                        <div className="w-12 h-3 bg-muted-foreground/10 rounded-full animate-pulse" />
                    </span>
                </div>

                {/* Message Bubble */}
                <div className="rounded-2xl px-4 py-3 bg-gradient-to-br from-muted/80 to-muted border border-border/50 text-foreground shadow-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex space-x-2">
                                <div className="h-3 bg-muted-foreground/10 rounded-full w-24 animate-pulse" style={{ animationDelay: '0ms' }} />
                                <div className="h-3 bg-muted-foreground/10 rounded-full w-32 animate-pulse" style={{ animationDelay: '100ms' }} />
                                <div className="h-3 bg-muted-foreground/10 rounded-full w-20 animate-pulse" style={{ animationDelay: '200ms' }} />
                            </div>
                            <div className="flex space-x-2">
                                <div className="h-3 bg-muted-foreground/10 rounded-full w-36 animate-pulse" style={{ animationDelay: '300ms' }} />
                                <div className="h-3 bg-muted-foreground/10 rounded-full w-28 animate-pulse" style={{ animationDelay: '400ms' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
