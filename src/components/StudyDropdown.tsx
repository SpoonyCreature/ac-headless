'use client';

import { BookOpen, ChevronDown, MessageSquare, BookMarked } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export default function StudyDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-muted-foreground rounded-md hover:text-foreground hover:bg-muted/50 transition-colors duration-200 group"
            >
                <BookOpen className="w-4 h-4" />
                Study
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-muted-foreground/70 group-hover:text-muted-foreground`} />
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute top-full left-0 mt-1 w-52 bg-background/95 backdrop-blur-sm rounded-lg border border-border/40 shadow-lg transform transition-all duration-200 origin-top-left ${isOpen
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
            >
                <div className="p-1.5">
                    <Link
                        href="/study/chat"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground rounded-md hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                    >
                        <MessageSquare className="w-4 h-4" />
                        AI Chat
                    </Link>
                    <Link
                        href="/study/bible-study"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground rounded-md hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                    >
                        <BookMarked className="w-4 h-4" />
                        Bible Study
                    </Link>
                </div>
            </div>
        </div>
    );
} 
