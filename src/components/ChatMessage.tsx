import { ChatMessage as ChatMessageType } from '@/src/types/chat';
import { User, Bot, ExternalLink, Quote } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import React, { useCallback } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface ChatMessageProps {
    message: ChatMessageType;
    isLastMessage?: boolean;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    // Function to handle reference clicks
    const handleReferenceClick = useCallback((refId: string) => {
        const element = document.getElementById(`source-${refId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.classList.add('highlight');
            setTimeout(() => element.classList.remove('highlight'), 2000);
        }
    }, []);


    // Function to render message content with references
    const renderContent = () => {
        if (!message.text) return null;
        if (!message.groundingSupports || !message.sources) {
            return (
                <div className="prose prose-lg max-w-none dark:prose-invert 
                    prose-p:my-0 prose-p:leading-relaxed prose-li:my-0.5 prose-ul:my-4
                    prose-headings:text-foreground/90 prose-headings:font-semibold
                    prose-strong:text-foreground/90 prose-strong:font-semibold
                    prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80
                    prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            p: ({ children }) => <p className="whitespace-pre-wrap mb-4 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="my-4 space-y-1">{children}</ul>,
                            li: ({ children }) => <li className="relative pl-1.5">{children}</li>,
                            sup: ({ children }) => <sup className="text-primary font-semibold text-[0.8em] relative top-[-0.4em] ml-[0.15em] bg-primary/10 px-1.5 py-0.5 rounded-md">{children}</sup>,
                            code: ({ children }) => <code className="font-mono text-[0.9em]">{children}</code>
                        }}
                    >
                        {message.text}
                    </ReactMarkdown>
                </div>
            );
        }

        // Create segments array to store all pieces of text and their references
        const segments: { text: string; refs?: number[] }[] = [];
        let currentPosition = 0;
        const text = message.text;

        // Sort supports by start index to process them in order
        const sortedSupports = [...message.groundingSupports].sort((a, b) =>
            a.segment.startIndex - b.segment.startIndex
        );

        // Process each support
        sortedSupports.forEach(support => {
            const { startIndex, endIndex, text: supportText } = support.segment;

            // Add text before the current support if any
            if (startIndex > currentPosition) {
                segments.push({
                    text: text.slice(currentPosition, startIndex)
                });
            }

            // Add the supported text with its references
            segments.push({
                text: supportText,
                refs: support.groundingChunkIndices.map(i => i + 1)
            });

            currentPosition = endIndex;
        });

        // Add any remaining text after the last support
        if (currentPosition < text.length) {
            segments.push({
                text: text.slice(currentPosition)
            });
        }

        // Generate markdown content with references
        const markdownContent = segments.map(segment => {
            if (segment.refs) {
                return `${segment.text}<sup>[${segment.refs.join(',')}]</sup>`;
            }
            return segment.text;
        }).join('');

        return (
            <div className="prose prose-lg max-w-none dark:prose-invert 
                prose-p:my-0 prose-p:leading-relaxed prose-li:my-0.5 prose-ul:my-4
                prose-headings:text-foreground/90 prose-headings:font-semibold
                prose-strong:text-foreground/90 prose-strong:font-semibold
                prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80
                prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        p: ({ children }) => <p className="whitespace-pre-wrap mb-4 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="my-4 space-y-1">{children}</ul>,
                        li: ({ children }) => <li className="relative pl-1.5">{children}</li>,
                        sup: ({ children }) => <sup className="text-primary font-semibold text-[0.8em] relative top-[-0.4em] ml-[0.15em] bg-primary/10 px-1.5 py-0.5 rounded-md">{children}</sup>,
                        code: ({ children }) => <code className="font-mono text-[0.9em]">{children}</code>
                    }}
                >
                    {markdownContent}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <div className={cn(
            "group relative flex gap-3 py-4 px-4 flex-col",
            "animate-in slide-in-from-bottom-2 duration-300 ease-out",
            isUser ?
                "bg-primary ml-auto mr-4" :
                "bg-muted/40 ml-4 mr-auto",
            "rounded-2xl my-6",
            "shadow-sm",
            "w-fit max-w-[90%]",
        )}>
            <div className={cn(
                "flex gap-8",
                isUser ? "justify-end" : "justify-start"
            )}>
                {/* Message Content */}
                <div className={cn(
                    "flex flex-col gap-1.5 min-w-0",
                    isUser && "items-end"
                )}>
                    {/* Name, Avatar and Time */}
                    <div className={cn(
                        "flex items-center gap-2 text-xs mb-1",
                        isUser && "flex-row-reverse"
                    )}>
                        {!isUser && (
                            <div className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-lg shadow-sm",
                                "bg-gradient-to-br from-muted/90 to-muted/70 dark:from-muted/60 dark:to-muted/40"
                            )}>
                                <Bot className="h-3 w-3 text-primary" />
                            </div>
                        )}
                        <span className={cn(
                            "font-medium",
                            isUser ? "text-primary-foreground" : "text-foreground/90"
                        )}>
                            {isUser ? 'You' : 'Assistant'}
                        </span>
                        <span className={cn(
                            isUser ? "text-primary-foreground/80" : "text-foreground/70"
                        )}>
                            •
                        </span>
                        <span className={cn(
                            isUser ? "text-primary-foreground/80" : "text-foreground/70"
                        )}>
                            {message.time}
                        </span>
                    </div>

                    {/* Message Text */}
                    <div className={cn(
                        "message-content text-[15px] leading-relaxed",
                        isUser ? "text-primary-foreground" : "text-foreground/90"
                    )}>
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* References Section */}
            {message.sources && message.sources.length > 0 && (
                <div className="mt-5">
                    <div className="text-xs font-medium text-foreground/60 mb-3">Sources:</div>
                    <div className="space-y-3">
                        {message.sources.map((source) => {
                            const refNumber = parseInt(source.id.replace('ref', ''));

                            return (
                                <div
                                    key={source.id}
                                    id={`source-${source.id}`}
                                    className={cn(
                                        "relative text-sm bg-background/80 p-4 rounded-xl",
                                        "border border-border/5 shadow-sm"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <Quote className="h-4 w-4 text-primary/70" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-primary/70 font-mono text-xs px-2 py-0.5 rounded-md bg-primary/5 font-medium">
                                                    [{refNumber}]
                                                </span>
                                                <span className="font-medium text-foreground/80">{source.title}</span>
                                            </div>
                                            <p className="text-muted-foreground/80 text-sm line-clamp-2 leading-relaxed">{source.text}</p>
                                            {source.uri && (
                                                <a
                                                    href={source.uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-2 text-primary/70 inline-flex items-center gap-1.5 text-xs font-medium"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    <span>View Source</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
} 