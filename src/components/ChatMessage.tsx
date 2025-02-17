import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ChatMessage as ChatMessageType } from '@/src/types/chat';
import { User, Bot, ExternalLink, Quote } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ChatMessageProps {
    message: ChatMessageType;
    isLastMessage?: boolean;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    // Custom components for markdown rendering
    const markdownComponents = {
        // Block-level components
        p: ({ children, ...props }) => (
            <p className="mb-4 last:mb-0 leading-7" {...props}>{children}</p>
        ),
        h1: ({ children, ...props }) => (
            <h1 className="text-2xl font-bold mt-6 first:mt-0 mb-4" {...props}>{children}</h1>
        ),
        h2: ({ children, ...props }) => (
            <h2 className="text-xl font-semibold mt-5 first:mt-0 mb-3" {...props}>{children}</h2>
        ),
        h3: ({ children, ...props }) => (
            <h3 className="text-lg font-medium mt-4 first:mt-0 mb-2" {...props}>{children}</h3>
        ),
        ul: ({ children, ...props }) => (
            <ul className="list-disc pl-6 mb-4 last:mb-0" {...props}>{children}</ul>
        ),
        ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-6 mb-4 last:mb-0" {...props}>{children}</ol>
        ),
        li: ({ children, ...props }) => (
            <li className="mb-1 last:mb-0" {...props}>{children}</li>
        ),
        blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-2 border-primary/20 pl-4 italic my-4" {...props}>{children}</blockquote>
        ),
        // Inline components
        strong: ({ children, ...props }) => (
            <strong className="font-semibold" {...props}>{children}</strong>
        ),
        em: ({ children, ...props }) => (
            <em className="italic" {...props}>{children}</em>
        ),
        code: ({ children, ...props }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
        ),
        pre: ({ children, ...props }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 last:mb-0" {...props}>{children}</pre>
        ),
        a: ({ children, href, ...props }) => (
            <a
                href={href}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
            >
                {children}
            </a>
        ),
    };

    // Function to render the main message content
    const renderContent = (text: string) => (
        <div className="text-sm text-foreground">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}
                className="markdown-content"
            >
                {text}
            </ReactMarkdown>
        </div>
    );

    // Function to render references section
    const renderReferences = () => {
        if (!message.sources || message.sources.length === 0) return null;

        return (
            <div className="mt-4 pl-9">
                <div className="text-sm font-medium text-muted-foreground mb-2">Sources:</div>
                <div className="space-y-2">
                    {message.sources.map((source, index) => (
                        <div
                            key={source.id}
                            className={cn(
                                "group relative text-sm bg-muted/30 p-3 rounded-md",
                                "hover:bg-muted/40 transition-colors"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    <Quote className="h-4 w-4 text-primary/60" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-primary font-mono text-xs px-1.5 py-0.5 rounded bg-primary/10">
                                            [{index + 1}]
                                        </span>
                                        <span className="font-medium">{source.title}</span>
                                    </div>
                                    <p className="text-muted-foreground line-clamp-2">{source.text}</p>
                                    {source.uri && (
                                        <a
                                            href={source.uri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            <span>View Source</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={cn(
            "group relative flex gap-3 py-4 px-4 flex-col",
            "animate-in slide-in-from-bottom-2 duration-300 ease-out",
            isUser ? "bg-muted/30" : "bg-background",
            "border-b border-border/5"
        )}>
            <div className="flex gap-3">
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
                    <div className="message-content">
                        {renderContent(message.text)}
                    </div>
                </div>
            </div>

            {/* References Section */}
            {renderReferences()}
        </div>
    );
} 