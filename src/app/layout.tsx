import type { Metadata, Viewport } from 'next';
import RootProvider from '@/components/layout/RootProvider';
import './globals.css';

export const metadata: Metadata = {
  title: '家庭菜单',
  description: '家庭菜单 - 每日点菜、购物清单、食材管理',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '家庭菜单',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
