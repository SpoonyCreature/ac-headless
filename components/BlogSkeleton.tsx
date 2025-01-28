export function BlogSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 animate-pulse">
            <div className="w-full h-[400px] bg-gray-200 rounded-lg mb-8" />
            <div className="w-3/4 h-8 bg-gray-200 rounded mb-4" />
            <div className="flex gap-4 mb-8">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="w-24 h-8 bg-gray-200 rounded" />
            </div>
            <div className="space-y-4">
                <div className="w-full h-4 bg-gray-200 rounded" />
                <div className="w-5/6 h-4 bg-gray-200 rounded" />
                <div className="w-4/6 h-4 bg-gray-200 rounded" />
            </div>
        </div>
    );
} 