import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-4 py-16 space-y-24">
                {/* Hero */}
                <section>
                    <h1 className="font-serif text-4xl md:text-5xl mb-6">
                        About Apologetics Central
                    </h1>
                    <p className="text-xl text-muted-foreground font-serif">
                        Founded in April 2014 in Pretoria, South Africa, we equip Christians with the tools necessary to defend their faith in Jesus when confronted with difficult questions.
                    </p>
                </section>

                {/* What We Believe */}
                <section>
                    <h2 className="font-serif text-3xl mb-6">What We Believe</h2>
                    <div className="space-y-6">
                        <p className="text-muted-foreground text-lg">
                            Officially, Apologetics Central holds the same confessions as the GKSA (Reformed Churches in South Africa). This includes the three forms of unity:
                        </p>
                        <ul className="grid gap-2 text-lg text-muted-foreground list-disc pl-5">
                            <li>The Belgic Confession</li>
                            <li>The Canons of Dort</li>
                            <li>The Heidelberg Catechism</li>
                        </ul>
                        <p className="text-muted-foreground text-lg">
                            We also hold to the Westminster Confession of Faith.
                        </p>
                    </div>
                </section>

                {/* Mission & Story */}
                <section>
                    <h2 className="font-serif text-3xl mb-6">You Have Questions. The Bible Has Answers.</h2>
                    <div className="space-y-12">
                        <div>
                            <h3 className="font-serif text-2xl mb-4">Our Mission</h3>
                            <p className="text-lg text-muted-foreground">
                                At Apologetics Central, we take a look at questions frequently asked regarding our faith in Jesus Christ and attempt to formulate decent and thorough Biblical answers that are easy to read and understandable. Christians don&apos;t have to back away when talking about their faith.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-serif text-2xl mb-4">Our Story</h3>
                            <p className="text-lg text-muted-foreground">
                                We aim to provide Christians with the tools necessary to defend their faith in Jesus when confronted with difficult questions asked by atheists and other religious believers. Through our range of services which include hosting discussions, publishing our own articles, making videos and reaching people through effective use of social media, we hope to make a difference and point people to the Truth that is made available to us all through the Word of God.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-serif text-2xl mb-4">Copyright Notice</h3>
                            <p className="text-lg text-muted-foreground">
                                This site belongs to Apologetics Central and no content may be copied without consent. All images used on this site are royalty-free and are displayed legally with the consent of their respective owners. As long as you always clearly reference and/or link to www.apologeticscentral.org as the source of the material, you have our permission to copy, print, and distribute our material.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-serif text-2xl mb-4">Disclosure</h3>
                            <p className="text-lg text-muted-foreground">
                                On our site, there are recommended resources for further reading by other ministries and apologists. Should the user click on the resource and purchase it from Amazon.com, we will receive a percentage of the sale as an affiliate payment.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="text-center">
                    <h2 className="font-serif text-3xl mb-4">Get in Touch</h2>
                    <p className="text-xl text-muted-foreground mb-8 font-serif max-w-2xl mx-auto">
                        Have questions or want to learn more? We&apos;d love to hear from you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Contact Us
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a
                            href="mailto:enquire@apologeticscentral.co.za"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg border hover:bg-muted transition-colors"
                        >
                            Email Us
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </section>
            </div>
        </main>
    );
}
