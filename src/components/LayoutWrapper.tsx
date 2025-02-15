'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutWrapperProps {
    children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const handleOpenSidebar = () => {
            setIsSidebarOpen(true);
        };

        window.addEventListener('open-sidebar', handleOpenSidebar);
        return () => {
            window.removeEventListener('open-sidebar', handleOpenSidebar);
        };
    }, []);

    return (
        <>
            {children}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </>
    );
}

export function openSidebar() {
    // This function will be called from the HeaderClient component
    window.dispatchEvent(new CustomEvent('open-sidebar'));
} 
