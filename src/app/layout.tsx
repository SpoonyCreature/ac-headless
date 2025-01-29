import '../styles/globals.css';
import { Header } from '@/src/components/Header';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Footer } from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

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
            <body className={`min-h-screen bg-background font-sans antialiased ${inter.className}`}>
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
} 