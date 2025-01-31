import { Send } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import { LoginButton } from './LoginButton';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    isAuthenticated?: boolean;
}

export function ChatInput({ onSend, disabled, isAuthenticated }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmedMessage = message.trim();

        if (trimmedMessage && !disabled) {
            try {
                onSend(trimmedMessage);
                setMessage('');
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
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

    const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 200);
            textarea.style.height = `${newHeight}px`;
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="rounded-lg bg-muted/30 border border-border/50 text-center p-4">
                <p className="text-sm text-muted-foreground mb-4">
                    Sign in to start a conversation
                </p>
                <LoginButton />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    placeholder="Type a message..."
                    className="w-full min-h-[56px] max-h-[200px] p-4 pr-12 rounded-lg bg-background border border-border/50 resize-none focus:outline-none focus:border-border focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/60"
                    disabled={disabled}
                    rows={1}
                />
                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className="absolute right-2 bottom-[10px] p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-2 text-xs text-center text-muted-foreground">
                Press Enter to send, Shift + Enter for new line
            </div>
        </form>
    );
} 