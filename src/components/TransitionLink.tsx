import { usePageTransition } from '@/src/hooks/usePageTransition';
import { cn } from '@/src/lib/utils';
import { ReactNode } from 'react';

interface TransitionLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function TransitionLink({ href, children, className, onClick }: TransitionLinkProps) {
    const { navigateWithTransition } = usePageTransition();

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        onClick?.();
        await navigateWithTransition(href);
    };

    return (
        <a
            href={href}
            onClick={handleClick}
            className={cn('transition-colors', className)}
        >
            {children}
        </a>
    );
} 