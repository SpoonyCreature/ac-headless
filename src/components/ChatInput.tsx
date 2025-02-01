import { Send, Loader2, Sparkles } from 'lucide-react';
import { FormEvent, useRef, useState, useEffect } from 'react';
import { LoginButton } from './LoginButton';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    isAuthenticated?: boolean;
}

export function ChatInput({ onSend, disabled, isAuthenticated }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Update textarea height whenever content changes
    useEffect(() => {
        adjustTextareaHeight();
    }, [message]);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Reset height to min to get accurate scrollHeight
            textarea.style.height = 'auto';
            // Set new height based on content (min 48px, max 200px)
            const newHeight = Math.max(48, Math.min(textarea.scrollHeight, 200));
            textarea.style.height = `${newHeight}px`;
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmedMessage = message.trim();

        if (trimmedMessage && !disabled) {
            try {
                onSend(trimmedMessage);
                setMessage('');
                // Reset height after sending
                if (textareaRef.current) {
                    textareaRef.current.style.height = '48px';
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="rounded-2xl bg-muted/50 border border-border/50 text-center p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-4">
                    <Sparkles className="w-5 h-5 mr-2 text-primary" />
                    <p className="text-sm font-medium">
                        Sign in to start chatting
                    </p>
                </div>
                <LoginButton />
            </div>
        );
    }

    return (
        <div className="relative backdrop-blur-sm" ref={containerRef}>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="w-full min-h-[48px] max-h-[200px] px-4 py-[14px] pr-12
                            resize-none overflow-y-auto
                            bg-background/95 rounded-[24px]
                            border border-border/50 shadow-lg
                            placeholder:text-muted-foreground/50
                            focus:outline-none focus:border-border focus:ring-2 focus:ring-primary/10
                            disabled:opacity-50 disabled:cursor-not-allowed
                            scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                        disabled={disabled}
                        rows={1}
                        style={{
                            lineHeight: '20px',
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || disabled}
                        className="absolute right-3 top-1/2 -translate-y-1/2
                            p-1.5 rounded-full
                            text-muted-foreground hover:text-primary
                            disabled:opacity-50 disabled:cursor-not-allowed 
                            transition-colors"
                    >
                        {disabled ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </form>
            <div className="mt-2 text-xs text-center text-muted-foreground/70">
                Press Enter to send • Shift + Enter for new line
            </div>
        </div>
    );
} 