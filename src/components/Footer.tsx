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
            console.log('Subscribe:', email);
            setSubscribeStatus('success');
            setEmail('');
        } catch (error) {
            setSubscribeStatus('error');
        } finally {
            setIsSubmitting(false);
            // Reset status after 3 seconds
            setTimeout(() => setSubscribeStatus('idle'), 3000);
        }
    };

    return (
        <footer className="border-t border-border/40 bg-gradient-to-b from-white to-slate-100" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">Footer</h2>
            <div className="container mx-auto px-4 py-12 lg:py-16">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* About Section */}
                    <div className="flex flex-col space-y-4">
                        <h3 className="font-serif text-lg ">Apologetics Central</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Dedicated to equipping Christians with Reformed Presuppositional Apologetics through scholarly resources and biblical wisdom.
                        </p>
                        <div className="flex gap-4 mt-auto pt-4">
                            <a
                                href="https://facebook.com/share"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Visit our Facebook page"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://twitter.com/intent/tweet"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Visit our Twitter page"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            <a
                                href="https://youtube.com/@apologeticscentral"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Visit our YouTube channel"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <nav className="flex flex-col space-y-4" aria-label="Footer navigation">
                        <h3 className="font-serif text-lg ">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group">
                                    About Us
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group">
                                    Articles
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group">
                                    Contact
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/ai" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group">
                                    Christian AI Q&A
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Resources */}
                    <nav className="flex flex-col space-y-4" aria-label="Resources navigation">
                        <h3 className="font-serif text-lg ">Resources</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="https://www.youtube.com/channel/UCZIMh9u64qA_Qo4HQhMh5eQ"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                                >
                                    <Youtube className="w-4 h-4" />
                                    YouTube Channel
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </a>
                            </li>
                            <li>
                                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group">
                                    Latest Articles
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Newsletter */}
                    <div className="flex flex-col space-y-4">
                        <h3 className="font-serif text-lg ">Stay Updated</h3>
                        <p className="text-sm text-muted-foreground">
                            Subscribe to our newsletter for the latest articles and resources.
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-2">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                    required
                                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                    disabled={isSubmitting}
                                    aria-label="Email address"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1 top-1 inline-flex items-center justify-center p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                    aria-label="Subscribe to newsletter"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Mail className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {subscribeStatus === 'success' && (
                                <p className="text-xs text-green-600">Thanks for subscribing!</p>
                            )}
                            {subscribeStatus === 'error' && (
                                <p className="text-xs text-red-600">Something went wrong. Please try again.</p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-border/40">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
                        <p className="text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
                            © {new Date().getFullYear()} Apologetics Central. All rights reserved.
                        </p>
                        <nav className="flex gap-6 order-1 sm:order-2" aria-label="Legal navigation">
                            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                                Terms of Service
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
        </footer>
    );
}
