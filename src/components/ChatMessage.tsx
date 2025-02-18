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
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-0 prose-p:leading-7 prose-li:my-0 prose-ul:my-4">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            p: ({ children }) => <p className="whitespace-pre-wrap mb-4 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="my-4">{children}</ul>,
                            li: ({ children }) => <li className="my-1">{children}</li>,
                            sup: ({ children }) => <sup className="text-primary font-bold text-[0.8em] relative top-[-0.4em] ml-[0.15em] bg-primary/10 px-1 rounded-sm">{children}</sup>
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
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-0 prose-p:leading-7 prose-li:my-0 prose-ul:my-4">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        p: ({ children }) => <p className="whitespace-pre-wrap mb-4 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="my-4">{children}</ul>,
                        li: ({ children }) => <li className="my-1">{children}</li>,
                        sup: ({ children }) => <sup className="text-primary font-bold text-[0.8em] relative top-[-0.4em] ml-[0.15em] bg-primary/10 px-1 rounded-sm">{children}</sup>
                    }}
                >
                    {markdownContent}
                </ReactMarkdown>
            </div>
        );
    };

    // Function to render references section
    const renderReferences = () => {
        if (!message.sources || message.sources.length === 0) return null;

        return (
            <div className="mt-4 pl-9">
                <div className="text-sm font-medium text-muted-foreground mb-2">Sources:</div>
                <div className="space-y-2">
                    {message.sources.map((source) => {
                        // Extract the reference number from the source ID (e.g., "ref1" -> 1)
                        const refNumber = parseInt(source.id.replace('ref', ''));

                        return (
                            <div
                                key={source.id}
                                id={`source-${source.id}`}
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
                                                [{refNumber}]
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
                        );
                    })}
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
                    <div className="message-content text-sm text-foreground">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* References Section */}
            {renderReferences()}
        </div>
    );
} 