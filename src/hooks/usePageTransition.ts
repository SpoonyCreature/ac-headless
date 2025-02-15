import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function usePageTransition() {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();

    const navigateWithTransition = async (path: string) => {
        setIsTransitioning(true);

        // Small delay to ensure transition starts
        await new Promise(resolve => setTimeout(resolve, 50));

        // Navigate
        router.push(path);

        // Keep transition state until navigation completes
        await new Promise(resolve => setTimeout(resolve, 300));

        setIsTransitioning(false);
    };

    return {
        isTransitioning,
        navigateWithTransition
    };
} 