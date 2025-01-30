import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat">
            {/* Hero Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 tracking-tight">About Apologetics Central</h1>
                        <p className="text-xl md:text-2xl text-muted-foreground font-serif leading-relaxed">
                            Founded in April 2014 in Pretoria, South Africa, we equip Christians with the tools necessary to defend their faith in Jesus when confronted with difficult questions.
                        </p>
                    </div>
                </div>
            </section>

            {/* What We Believe Section */}
            <section className="py-16 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-serif text-3xl font-bold mb-6 tracking-tight">What We Believe</h2>
                        <div className="space-y-6 text-lg leading-relaxed">
                            <p className="text-muted-foreground">
                                Officially, Apologetics Central holds the same confessions as the GKSA (Reformed Churches in South Africa). This includes the three forms of unity:
                            </p>
                            <ul className="space-y-2 list-disc pl-6 text-muted-foreground">
                                <li>The Belgic Confession</li>
                                <li>The Canons of Dort</li>
                                <li>The Heidelberg Catechism</li>
                            </ul>
                            <p className="text-muted-foreground">
                                We also hold to the Westminster Confession of Faith.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Mission Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-serif text-3xl font-bold mb-6 tracking-tight">You Have Questions. The Bible Has Answers.</h2>
                        <div className="space-y-12">
                            <div className="space-y-6 text-lg leading-relaxed">
                                <p className="text-muted-foreground">
                                    At Apologetics Central, we take a look at questions frequently asked regarding our faith in Jesus Christ and attempt to formulate decent and thorough Biblical answers that are easy to read and understandable. Christians don&apos;t have to back away when talking about their faith.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-serif text-2xl font-semibold tracking-tight">Our Story</h3>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    We aim to provide Christians with the tools necessary to defend their faith in Jesus when confronted with difficult questions asked by atheists and other religious believers. Through our range of services which include hosting discussions, publishing our own articles, making videos and reaching people through effective use of social media, we hope to make a difference and point people to the Truth that is made available to us all through the Word of God.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-serif text-2xl font-semibold tracking-tight">Copyright Notice</h3>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    This site belongs to Apologetics Central and no content may be copied without consent. All images used on this site are royalty-free and are displayed legally with the consent of their respective owners. As long as you always clearly reference and/or link to www.apologeticscentral.org as the source of the material, you have our permission to copy, print, and distribute our material.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-serif text-2xl font-semibold tracking-tight">Disclosure</h3>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    On our site, there are recommended resources for further reading by other ministries and apologists. Should the user click on the resource and purchase it from Amazon.com, we will receive a percentage of the sale as an affiliate payment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-serif text-3xl font-bold mb-4 tracking-tight">Get in Touch</h2>
                        <p className="text-xl text-muted-foreground mb-8 font-serif leading-relaxed max-w-2xl mx-auto">
                            Have questions or want to learn more? We&apos;d love to hear from you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-base font-medium"
                            >
                                Contact Us
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a
                                href="mailto:enquire@apologeticscentral.co.za"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-border hover:bg-muted transition-all text-base font-medium"
                            >
                                Email Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
