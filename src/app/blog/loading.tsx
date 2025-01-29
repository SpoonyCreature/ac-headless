import { BlogListSkeleton } from '@/src/components/Skeletons';

export default function BlogLoading() {
    return (
        <main className="min-h-screen bg-[url('/paper-texture.png')] bg-repeat py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto">
                    <BlogListSkeleton />
                </div>
            </div>
        </main>
    );
}