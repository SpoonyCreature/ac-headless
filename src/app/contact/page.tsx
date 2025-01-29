'use client';

import { Mail, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement contact form submission
        console.log('Form submitted:', formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <main className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
                        <p className="text-lg text-muted-foreground font-serif leading-relaxed">
                            Have questions about Reformed Presuppositional Apologetics? We're here to help and engage in meaningful dialogue.
                        </p>
                    </div>

                    {/* Contact Methods */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="p-6 rounded-xl border border-border bg-card">
                            <Mail className="w-8 h-8 text-primary mb-4" />
                            <h2 className="font-serif text-xl font-bold mb-2">Email Us</h2>
                            <p className="text-muted-foreground mb-4">
                                Send us an email directly and we'll get back to you as soon as possible.
                            </p>
                            <a href="mailto:contact@apologeticscentral.com" className="text-primary hover:text-primary/80 transition-colors">
                                contact@apologeticscentral.com
                            </a>
                        </div>
                        <div className="p-6 rounded-xl border border-border bg-card">
                            <MessageSquare className="w-8 h-8 text-primary mb-4" />
                            <h2 className="font-serif text-xl font-bold mb-2">Send a Message</h2>
                            <p className="text-muted-foreground">
                                Use the contact form below to send us a message. We'll respond promptly to your inquiry.
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-medium">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="subject" className="block text-sm font-medium">
                                Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="message" className="block text-sm font-medium">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={6}
                                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-base font-medium w-full md:w-auto"
                        >
                            Send Message
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
} 