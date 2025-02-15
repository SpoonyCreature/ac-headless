'use client';

import { Facebook, Mail, Youtube, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function Footer() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // TODO: Implement newsletter subscription
            setSubscribeStatus('success');
            setEmail('');
        } catch (error) {
            setSubscribeStatus('error');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubscribeStatus('idle'), 3000);
        }
    };

    return (
        <footer className="relative mt-20">
            {/* Decorative top border */}
            <div className="absolute inset-x-0 -top-8 h-8">
                <div className="h-full w-full bg-[radial-gradient(50%_100%_at_top,rgba(var(--primary-rgb),0.15),transparent)]" />
            </div>

            <div className="relative bg-slate-900/95 backdrop-blur-sm">
                {/* Main content */}
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
                    {/* Newsletter Section - Full Width on Mobile */}
                    <div className="py-16 border-b border-white/10">
                        <div className="flex flex-col items-center text-center">
                            <h3 className="text-lg font-medium text-white mb-3">
                                Join Our Community
                            </h3>
                            <p className="text-sm text-slate-300 max-w-md mb-6">
                                Get weekly insights on Reformed Apologetics and exclusive resources.
                            </p>
                            <form onSubmit={handleSubscribe} className="w-full max-w-md">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 h-12 text-sm bg-white/10 border border-slate-700 rounded-xl 
                                                     text-white placeholder:text-slate-400
                                                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
                                                     hover:bg-white/[0.15] transition-colors duration-300"
                                            required
                                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-12 px-6 rounded-xl bg-primary/90 text-primary-foreground font-medium
                                                 hover:bg-primary transition-colors duration-300
                                                 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-slate-900
                                                 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            'Subscribe'
                                        )}
                                    </button>
                                </div>
                                {subscribeStatus === 'success' && (
                                    <p className="mt-3 text-sm text-emerald-300 flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        You're in! Check your inbox
                                    </p>
                                )}
                                {subscribeStatus === 'error' && (
                                    <p className="mt-3 text-sm text-red-300 flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        Oops! Please try again
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="py-16 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6 lg:gap-12">
                        {/* Brand */}
                        <div className="col-span-2 lg:col-span-2">
                            <h3 className="text-xl font-serif text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
                                Apologetics Central
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed mb-6">
                                Dedicated to equipping Christians with Reformed Presuppositional Apologetics through scholarly resources and biblical wisdom.
                            </p>
                            <div className="flex gap-4">
                                <a
                                    href="https://facebook.com/share"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 -m-2 text-slate-400 hover:text-primary transition-colors duration-300"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://twitter.com/intent/tweet"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 -m-2 text-slate-400 hover:text-primary transition-colors duration-300"
                                    aria-label="Twitter"
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://youtube.com/@apologeticscentral"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 -m-2 text-slate-400 hover:text-primary transition-colors duration-300"
                                    aria-label="YouTube"
                                >
                                    <Youtube className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="col-span-1">
                            <h4 className="text-sm font-medium text-white mb-6">Quick Links</h4>
                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        href="/about"
                                        className="text-sm text-slate-300 hover:text-primary transition-colors duration-300 block"
                                    >
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/blog"
                                        className="text-sm text-slate-300 hover:text-primary transition-colors duration-300 block"
                                    >
                                        Articles
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/contact"
                                        className="text-sm text-slate-300 hover:text-primary transition-colors duration-300 block"
                                    >
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/study"
                                        className="text-sm text-slate-300 hover:text-primary transition-colors duration-300 block"
                                    >
                                        Study Resources
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div className="col-span-1">
                            <h4 className="text-sm font-medium text-white mb-6">Resources</h4>
                            <ul className="space-y-4">
                                <li>
                                    <a
                                        href="https://www.youtube.com/channel/UCZIMh9u64qA_Qo4HQhMh5eQ"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-slate-300 hover:text-primary transition-colors duration-300 block"
                                    >
                                        YouTube Channel
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        href="/blog"
                                        className="text-sm text-slate-300 hover:text-primary transition-colors duration-300 block"
                                    >
                                        Latest Articles
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="py-8 border-t border-slate-800">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-slate-400 order-2 sm:order-1">
                                © {new Date().getFullYear()} Apologetics Central
                            </p>
                            <nav className="flex gap-6 order-1 sm:order-2" aria-label="Legal">
                                <Link
                                    href="/privacy"
                                    className="text-sm text-slate-400 hover:text-primary transition-colors duration-300"
                                >
                                    Privacy
                                </Link>
                                <Link
                                    href="/terms"
                                    className="text-sm text-slate-400 hover:text-primary transition-colors duration-300"
                                >
                                    Terms
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
