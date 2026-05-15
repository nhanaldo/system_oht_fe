// File: app/layout.tsx
import { Roboto } from "next/font/google";
import "./globals.css";
import { App, ConfigProvider } from 'antd';

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
        <html lang="vi" className={roboto.variable}>
            <body className={roboto.className}>
                <ConfigProvider theme={{ token: { fontFamily: 'var(--font-roboto), sans-serif' } }}>
                    <App>{children}</App>
                </ConfigProvider>
            </body>
        </html>
    );
}