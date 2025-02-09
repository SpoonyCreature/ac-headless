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
            "group relative flex gap-3 px-4 py-4",
            "animate-in slide-in-from-bottom-2 duration-300 ease-out",
            isUser ? "bg-muted/30" : "bg-background",
            "border-b border-border/5"
        )}>
            {/* Avatar */}
            <div className="flex h-6 w-6 shrink-0 select-none items-center justify-center">
                <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full",
                    "transition-all duration-300 hover:scale-110",
                    isUser ? "bg-primary" : "bg-muted"
                )}>
                    {isUser ? (
                        <User className="h-3 w-3 text-primary-foreground" />
                    ) : (
                        <Bot className="h-3 w-3 text-primary" />
                    )}
                </div>
            </div>

            {/* Message Content */}
            <div className="flex flex-col gap-1 min-w-0 max-w-full flex-1">
                {/* Name and Time */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">
                        {isUser ? 'You' : 'Assistant'}
                    </span>
                    <span className="text-muted-foreground/60">
                        {message.time}
                    </span>
                </div>

                {/* Message Text */}
                <div className={cn(
                    "prose prose-sm max-w-none",
                    "prose-stone dark:prose-invert",
                    "marker:text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                )}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-base font-semibold mt-6 first:mt-0 mb-4" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-sm font-semibold mt-5 first:mt-0 mb-3" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-sm font-medium mt-4 first:mt-0 mb-3" {...props} />,
                            p: ({ node, ...props }) => <p className="leading-relaxed mb-2 last:mb-0" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 last:mb-0 marker:text-primary/70" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 last:mb-0 marker:text-primary/70" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1 last:mb-0" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-2 border-primary/20 pl-3 italic my-2" {...props} />
                            ),
                            code: ({ node, inline, className, children, ...props }: {
                                node?: any;
                                inline?: boolean;
                                className?: string;
                                children?: React.ReactNode;
                            } & React.HTMLAttributes<HTMLElement>) =>
                                inline ? (
                                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs" {...props}>{children}</code>
                                ) : (
                                    <code className="block rounded-lg bg-muted p-3 font-mono text-xs overflow-x-auto my-2" {...props}>{children}</code>
                                ),
                            a: ({ node, ...props }) => (
                                <a className="text-primary underline-offset-4 hover:underline transition-colors" {...props} />
                            ),
                            strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                            em: ({ node, ...props }) => <em className="italic text-primary/90" {...props} />,
                        }}
                    >
                        {message.text}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
} 