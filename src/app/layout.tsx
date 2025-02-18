import '../styles/globals.css';
import { Header } from '@/src/components/Header';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Footer } from '../components/Footer';
import { LayoutWrapper } from '../components/LayoutWrapper';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    preload: true,
    fallback: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        'Fira Sans',
        'Droid Sans',
        'Helvetica Neue',
        'sans-serif'
    ],
    adjustFontFallback: true,
    variable: '--font-inter'
});

export const metadata: Metadata = {
    title: 'Apologetics Central',
    description: 'Equipping Christians with Reformed Presuppositional Apologetics',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`min-h-screen bg-background font-sans antialiased ${inter.variable}`}>
                <LayoutWrapper>
                    <div className="flex min-h-screen flex-col">
                        <Header />
                        <main className="flex-1">
                            <div >
                                {children}
                            </div>
                        </main>
                        <Footer />
                    </div>
                </LayoutWrapper>
            </body>
        </html>
    );
} 