import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-xl mx-auto text-center">
                    <h1 className="font-serif text-4xl mb-6">Article Not Found</h1>
                    <p className="text-lg text-muted-foreground mb-8 font-serif leading-relaxed">
                        The article you&apos;re looking for doesn&apos;t exist or has been removed.
                    </p>
                    <Link
                        href="/blog"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-base font-medium"
                    >
                        ← Back to Articles
                    </Link>
                </div>
            </div>
        </div>
    );
}