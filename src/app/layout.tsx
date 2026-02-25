import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { DotGothic16 } from 'next/font/google';
import { Toast } from '@/components/ui/Toast';
import { AudioUnlocker } from '@/components/ui/AudioUnlocker';
import './globals.css';

const dotGothic16 = DotGothic16({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dot-gothic',
});

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
        className={`${GeistSans.variable} ${GeistMono.variable} ${dotGothic16.variable} antialiased`}
      >
        {children}
        <Toast />
        <AudioUnlocker />
      </body>
    </html>
  );
}
