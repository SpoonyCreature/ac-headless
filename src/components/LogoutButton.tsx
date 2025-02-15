'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

interface LogoutButtonProps {
    action: () => Promise<void>;
}

export function LogoutButton({ action }: LogoutButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleLogout = () => {
        startTransition(async () => {
            try {
                await action();
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isPending}
            className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1"
        >
            {isPending ? (
                <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Logging out...</span>
                </>
            ) : (
                <span>Logout</span>
            )}
        </button>
    );
} 
