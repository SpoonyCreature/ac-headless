'use client';

import { Menu } from 'lucide-react';

export function HeaderClient() {
    const handleOpenSidebar = () => {
        window.dispatchEvent(new CustomEvent('open-sidebar'));
    };

    return (
        <button
            onClick={handleOpenSidebar}
            className="p-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Open menu"
        >
            <Menu className="w-5 h-5" />
        </button>
    );
} 