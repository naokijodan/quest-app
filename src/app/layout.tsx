import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Toast } from '@/components/ui/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quest App - AI Workflow',
  description:
    'ゲーム感覚でAIを使いこなそう。クエストを選んで30秒で成果物を手に入れる。',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Quest App',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {children}
        <Toast />
      </body>
    </html>
  );
}
