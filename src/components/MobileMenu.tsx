'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="md:hidden relative z-10 p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={toggleMenu}
                aria-label="Toggle menu"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/80 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={toggleMenu}
            />

            {/* Mobile Menu Panel */}
            <div
                className={`fixed inset-y-0 right-0 w-64 bg-background shadow-lg border-l border-border transform transition-transform duration-300 ease-in-out md:hidden z-[100] ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="p-6">
                    <button
                        onClick={toggleMenu}
                        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <div className="flex flex-col space-y-6 mt-8">
                        <Link href="/" className="mobile-nav-link" onClick={toggleMenu}>Home</Link>
                        <Link href="/blog" className="mobile-nav-link" onClick={toggleMenu}>Articles</Link>
                        <div className="space-y-3">
                            <Link href="/study" className="mobile-nav-link" onClick={toggleMenu}>Study</Link>
                            <div className="pl-4 space-y-3">
                                <Link href="/study/bible-study" className="mobile-nav-link text-sm" onClick={toggleMenu}>Bible Study</Link>
                                <Link href="/study/chat" className="mobile-nav-link text-sm" onClick={toggleMenu}>Discussion</Link>
                            </div>
                        </div>
                        <Link href="/about" className="mobile-nav-link" onClick={toggleMenu}>About</Link>
                    </div>
                </div>
            </div>
        </>
    );
} 