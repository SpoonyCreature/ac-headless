import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
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
            "group relative flex gap-4 px-4 py-3",
            "animate-in slide-in-from-bottom-2 duration-300 ease-out",
            isUser ? "flex-row-reverse" : "flex-row"
        )}>
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center">
                <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                    "hover:scale-110 cursor-pointer",
                    isUser ?
                        "bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-lg shadow-primary/25" :
                        "bg-gradient-to-br from-muted via-muted/90 to-muted/80 shadow-lg"
                )}>
                    {isUser ? (
                        <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                        <Bot className="h-4 w-4 text-primary" />
                    )}
                </div>
            </div>

            {/* Message Content */}
            <div className={cn(
                "flex flex-col gap-1.5 group/message",
                isUser ? "items-end" : "items-start",
                "min-w-0 max-w-[calc(100%-64px)] lg:max-w-[calc(100%-96px)]"
            )}>
                {/* Name and Time */}
                <div className={cn(
                    "flex items-center gap-2 text-xs transition-opacity duration-200",
                    "opacity-50 group-hover/message:opacity-100",
                    isUser ? "flex-row-reverse" : "flex-row"
                )}>
                    <span className="font-medium">
                        {isUser ? 'You' : 'Assistant'}
                    </span>
                    <span className="text-muted-foreground">
                        {message.time}
                    </span>
                </div>

                {/* Message Bubble */}
                <div className={cn(
                    "relative rounded-2xl px-4 py-3 text-sm",
                    "transition-all duration-200 ease-out",
                    "hover:shadow-md",
                    isUser ?
                        "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-sm shadow-primary/10" :
                        "bg-gradient-to-br from-card to-muted/90 border border-border/50 shadow-sm"
                )}>
                    <div className={cn(
                        "prose prose-sm max-w-none",
                        isUser ? "prose-invert" : "prose-stone dark:prose-invert",
                        "marker:text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                        "transition-all duration-200"
                    )}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-base font-semibold mt-6 first:mt-0 mb-4 animate-in fade-in-50" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-sm font-semibold mt-5 first:mt-0 mb-3 animate-in fade-in-50" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-sm font-medium mt-4 first:mt-0 mb-3 animate-in fade-in-50" {...props} />,
                                p: ({ node, ...props }) => <p className="leading-relaxed mb-2 last:mb-0 animate-in fade-in-50" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 last:mb-0 marker:text-primary/70 animate-in fade-in-50" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 last:mb-0 marker:text-primary/70 animate-in fade-in-50" {...props} />,
                                li: ({ node, ...props }) => <li className="mb-1 last:mb-0 animate-in fade-in-50" {...props} />,
                                blockquote: ({ node, ...props }) => (
                                    <blockquote className="border-l-2 border-primary/20 pl-3 italic my-2 animate-in slide-in-from-left-2" {...props} />
                                ),
                                code: ({ node, inline, className, children, ...props }: {
                                    node?: any;
                                    inline?: boolean;
                                    className?: string;
                                    children?: React.ReactNode;
                                } & React.HTMLAttributes<HTMLElement>) =>
                                    inline ? (
                                        <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs animate-in fade-in-50" {...props}>{children}</code>
                                    ) : (
                                        <code className="block rounded-lg bg-muted/50 p-3 font-mono text-xs overflow-x-auto my-2 animate-in zoom-in-50" {...props}>{children}</code>
                                    ),
                                a: ({ node, ...props }) => (
                                    <a className="text-primary underline-offset-4 hover:underline transition-colors" {...props} />
                                ),
                                strong: ({ node, ...props }) => <strong className="font-semibold animate-in fade-in-50" {...props} />,
                                em: ({ node, ...props }) => <em className="italic text-primary/90 animate-in fade-in-50" {...props} />,
                            }}
                        >
                            {message.text}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
} 