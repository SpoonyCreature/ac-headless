import Link from 'next/link';

export default function Header() {
    return (
        <header className="header">
            <div className="header-content">
                <Link href="/" className="logo">Apologetics Central.</Link>
            </div>
        </header>
    );
} 