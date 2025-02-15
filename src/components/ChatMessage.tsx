import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ChatMessage as ChatMessageType } from '@/src/types/chat';
import { User, Bot, ExternalLink } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    // Function to handle reference clicks
    const handleReferenceClick = (refNum: string) => {
        const element = document.getElementById(`ref-${message._id}-${refNum}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.classList.add('highlight-source');
            setTimeout(() => element.classList.remove('highlight-source'), 2000);
        }
    };

    const markdownComponents = {
        p: ({ children }) => <span className="inline">{children}</span>,
        strong: ({ children }) => <strong className="inline font-semibold">{children}</strong>,
        em: ({ children }) => <em className="inline italic">{children}</em>,
        li: ({ children }) => <li className="mb-0.5 last:mb-0">{children}</li>,
        h1: ({ children }) => <h1 className="text-xl font-semibold mt-6 first:mt-0 mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 first:mt-0 mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-medium mt-3 mb-2">{children}</h3>,
    };

    // Function to process references in text using groundingSupports
    const processReferences = (text: string) => {
        const renderMarkdown = (content: string, key?: string) => (
            <span key={key} className="inline">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                >
                    {content}
                </ReactMarkdown>
            </span>
        );

        if (!message.groundingSupports || !message.sources) {
            return renderMarkdown(text);
        }

        // Find all supports that overlap with this text
        const relevantSupports = message.groundingSupports
            .filter(support => {
                const supportText = support.segment.text;
                return text.includes(supportText);
            })
            .sort((a, b) => text.indexOf(a.segment.text) - text.indexOf(b.segment.text));

        if (relevantSupports.length === 0) {
            return renderMarkdown(text);
        }

        const parts: (string | React.ReactNode)[] = [];
        let currentIndex = 0;

        // Process each relevant support
        for (const support of relevantSupports) {
            const supportText = support.segment.text;
            const localStart = text.indexOf(supportText, currentIndex);

            if (localStart === -1) continue;

            const localEnd = localStart + supportText.length;

            // Add text before this segment
            if (localStart > currentIndex) {
                const beforeText = text.slice(currentIndex, localStart);
                parts.push(renderMarkdown(beforeText, `before-${localStart}`));
            }

            // Calculate average confidence score
            const avgConfidence = support.confidenceScores?.length
                ? support.confidenceScores.reduce((a, b) => a + b, 0) / support.confidenceScores.length
                : 1;

            // Add the segment text with its references
            parts.push(
                <span key={`segment-${localStart}`} className="inline group/ref">
                    &nbsp;
                    <span
                        className={cn(
                            "inline border-b border-dashed transition-colors duration-200",
                            avgConfidence > 0.8 ? "border-primary/50" : "border-yellow-500/50",
                            "group-hover/ref:border-primary"
                        )}
                    >
                        {renderMarkdown(supportText)}
                    </span>
                    <span className="inline-flex gap-0.5 ml-0.5">
                        {support.groundingChunkIndices.map((chunkIndex, i) => {
                            const refNum = chunkIndex + 1;
                            const source = message.sources?.find(s => s.id === `ref${refNum}`);
                            if (!source) return null;

                            return (
                                <Tooltip.Provider key={`ref-${refNum}-${i}`}>
                                    <Tooltip.Root delayDuration={300}>
                                        <Tooltip.Trigger asChild>
                                            <button
                                                onClick={() => handleReferenceClick(refNum.toString())}
                                                className={cn(
                                                    "relative -top-1 inline-flex h-3.5 min-w-[1.5rem] items-center justify-center",
                                                    "rounded-full px-1 text-[10px] font-medium transition-colors",
                                                    "bg-primary/10 text-primary hover:bg-primary/20",
                                                    avgConfidence > 0.8 ? "bg-primary/10" : "bg-yellow-500/10",
                                                    avgConfidence > 0.8 ? "text-primary" : "text-yellow-600",
                                                    avgConfidence > 0.8 ? "hover:bg-primary/20" : "hover:bg-yellow-500/20"
                                                )}
                                            >
                                                {refNum}
                                            </button>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content
                                                className="z-50 max-w-[300px] rounded-md bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md"
                                                side="top"
                                                sideOffset={5}
                                            >
                                                <p className="font-medium mb-1">{source.title}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{source.text}</p>
                                                <Tooltip.Arrow className="fill-popover" />
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </Tooltip.Provider>
                            );
                        })}
                    </span>
                </span>
            );

            currentIndex = localEnd;
        }

        // Add any remaining text
        if (currentIndex < text.length) {
            const afterText = text.slice(currentIndex);
            parts.push(renderMarkdown(afterText, 'after'));
        }

        return <>{parts}</>;
    };

    // Split the message text into paragraphs and process each
    const processedText = message.text.split('\n\n').map((paragraph, index) => (
        <div key={index} className="mb-3 last:mb-0">
            {processReferences(paragraph)}
        </div>
    ));

    console.log("MESSAGE", message);

    return (
        <div className={cn(
            "group relative flex gap-3 px-4 py-4 flex-col",
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
                    <div className={cn(
                        "prose prose-sm dark:prose-invert max-w-none",
                        "prose-p:leading-relaxed prose-p:mb-3 last:prose-p:mb-0",
                        "prose-strong:font-semibold prose-strong:text-foreground",
                        "prose-ul:my-2 prose-li:my-0",
                        "prose-ol:list-decimal prose-ol:pl-4 prose-ol:my-2",
                        "prose-li:mb-0.5 last:prose-li:mb-0",
                        "prose-h1:text-xl prose-h1:font-semibold prose-h1:mt-6 first:prose-h1:mt-0 prose-h1:mb-4",
                        "prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-4 first:prose-h2:mt-0 prose-h2:mb-2",
                        "prose-h3:text-base prose-h3:font-medium prose-h3:mt-3 prose-h3:mb-2"
                    )}>
                        {processedText}
                    </div>
                </div>
            </div>

            {/* Sources Section */}
            {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pl-9">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Sources:</div>
                    <div className="space-y-3">
                        {message.sources.map((source) => (
                            <div
                                key={source.id}
                                id={`ref-${message._id}-${source.id.replace('ref', '')}`}
                                className={cn(
                                    "text-sm bg-muted/30 p-3 rounded-md transition-colors",
                                    "hover:bg-muted/40"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary font-mono text-xs px-1.5 py-0.5 rounded bg-primary/10">
                                            [{source.id.replace('ref', '')}]
                                        </span>
                                        <span className="font-medium">{source.title}</span>
                                    </div>
                                    {source.uri && (
                                        <a
                                            href={source.uri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            <span>View Source</span>
                                        </a>
                                    )}
                                </div>
                                <p className="text-muted-foreground">
                                    {source.text.split(' ').slice(0, 120).join(' ') + (source.text.split(' ').length > 120 ? '...' : '')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes highlightSource {
                    0% { 
                        background-color: hsl(var(--primary) / 0.3);
                        transform: scale(1.02);
                    }
                    10% {
                        transform: scale(1);
                    }
                    100% { 
                        background-color: hsl(var(--muted) / 0.3);
                    }
                }
                
                .highlight-source {
                    animation: highlightSource 2s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
} 