'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Home, FileText, BookOpen,
    MessageSquare, BookMarked, ChevronRight,
    Info
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SidebarSkeleton } from './Skeletons';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading?: boolean;
}

export function Sidebar({ isOpen, onClose, isLoading = false }: SidebarProps) {
    const [isStudyOpen, setIsStudyOpen] = useState(false);

    // Update body overflow when isOpen changes
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (isLoading) {
        return (
            <>
                {/* Backdrop */}
                <div
                    className={cn(
                        "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity z-40",
                        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    onClick={onClose}
                />
                <SidebarSkeleton />
            </>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity z-40",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <aside className={cn(
                "fixed top-0 bottom-0 right-0 z-50 w-[min(20rem,calc(100vw-2rem))] bg-background/95 backdrop-blur-md shadow-2xl border-l border-border/40",
                "transform transition-transform duration-300 ease-in-out",
                "flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-8 px-6">
                    <div className="space-y-2.5">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 text-base font-medium text-muted-foreground rounded-md hover:text-foreground hover:bg-muted/50 transition-colors"
                            onClick={onClose}
                        >
                            <Home className="w-5 h-5" />
                            Home
                        </Link>
                        <Link
                            href="/blog"
                            className="flex items-center gap-3 px-4 py-3 text-base font-medium text-muted-foreground rounded-md hover:text-foreground hover:bg-muted/50 transition-colors"
                            onClick={onClose}
                        >
                            <FileText className="w-5 h-5" />
                            Articles
                        </Link>

                        {/* Study Section */}
                        <div>
                            <div className={cn(
                                "flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-muted-foreground rounded-md hover:text-foreground hover:bg-muted/50 transition-colors group",
                                isStudyOpen && "text-foreground bg-muted/50"
                            )}>
                                <Link
                                    href="/study"
                                    className="flex items-center gap-3 flex-1"
                                    onClick={onClose}
                                >
                                    <BookOpen className="w-5 h-5" />
                                    <span className="flex-1 text-left">Study</span>
                                </Link>
                                <button
                                    onClick={() => setIsStudyOpen(!isStudyOpen)}
                                    className="p-1 -m-1 hover:bg-muted/80 rounded transition-colors"
                                >
                                    <ChevronRight className={cn(
                                        "w-4 h-4 transition-transform",
                                        isStudyOpen && "rotate-90"
                                    )} />
                                </button>
                            </div>

                            <div className={cn(
                                "overflow-hidden transition-all duration-200",
                                isStudyOpen ? "max-h-40 mt-1" : "max-h-0"
                            )}>
                                <Link
                                    href="/study/chat"
                                    className="flex items-center gap-3 px-4 py-3 pl-12 text-[15px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-md"
                                    onClick={onClose}
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    Discussion
                                </Link>
                                <Link
                                    href="/study/bible-study"
                                    className="flex items-center gap-3 px-4 py-3 pl-12 text-[15px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-md"
                                    onClick={onClose}
                                >
                                    <BookMarked className="w-5 h-5" />
                                    Bible Study
                                </Link>
                            </div>
                        </div>

                        <Link
                            href="/about"
                            className="flex items-center gap-3 px-4 py-3 text-base font-medium text-muted-foreground rounded-md hover:text-foreground hover:bg-muted/50 transition-colors"
                            onClick={onClose}
                        >
                            <Info className="w-5 h-5" />
                            About
                        </Link>
                    </div>
                </nav>
            </aside>
        </>
    );
}
