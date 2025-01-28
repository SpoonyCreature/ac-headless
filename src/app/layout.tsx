import '../styles/globals.css';
import { Header } from '@/src/components/Header';

export const metadata = {
    title: 'Apologetics Central',
    description: 'Your source for apologetics content',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Header />
                {children}
            </body>
        </html>
    );
} 