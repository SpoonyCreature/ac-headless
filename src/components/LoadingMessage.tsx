import { Bot } from 'lucide-react';

export function LoadingMessage() {
    return (
        <div className="group relative flex gap-4 p-6 transition-colors bg-background">
            <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/25 flex items-center justify-center shadow-sm">
                    <Bot className="w-5 h-5 text-primary" />
                </div>
            </div>
            <div className="flex-1 space-y-2.5 min-w-0">
                <div className="flex items-center space-x-2">
                    <div className="w-16 h-5 bg-primary/10 rounded-md animate-pulse" />
                </div>
                <div className="space-y-2">
                    <div className="flex space-x-2">
                        <div className="h-4 bg-primary/10 rounded w-24 animate-pulse" style={{ animationDelay: '0ms' }} />
                        <div className="h-4 bg-primary/10 rounded w-32 animate-pulse" style={{ animationDelay: '100ms' }} />
                        <div className="h-4 bg-primary/10 rounded w-20 animate-pulse" style={{ animationDelay: '200ms' }} />
                    </div>
                    <div className="flex space-x-2">
                        <div className="h-4 bg-primary/10 rounded w-36 animate-pulse" style={{ animationDelay: '300ms' }} />
                        <div className="h-4 bg-primary/10 rounded w-28 animate-pulse" style={{ animationDelay: '400ms' }} />
                    </div>
                </div>
            </div>
            <div className="absolute left-0 w-1 top-0 bottom-0">
                <div className="w-full h-full bg-primary/20" />
            </div>
        </div>
    );
} 
