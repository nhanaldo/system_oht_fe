// File: app/layout.tsx
import { Roboto } from "next/font/google";
import "./globals.css";
import { App } from 'antd';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    preload: true,
    variable: '--font-roboto',
    display: 'swap',
    adjustFontFallback: false,
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <App>
            <html lang="vi" className={roboto.variable}>
                <body className={roboto.className}>{children}</body>
            </html>
        </App>
    );
}