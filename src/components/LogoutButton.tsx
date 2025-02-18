'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
    action: () => Promise<void>;
}

export function LogoutButton({ action }: LogoutButtonProps) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        setIsPending(true); // Set isPending immediately on click
        action().then(() => {
            // After successful logout, navigate to home
            router.push('/');
            router.refresh();
        }).catch((error) => {
            console.error('Logout error:', error);
            setIsPending(false); // Consider resetting on error, or handle error state differently
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
