import './globals.css';
import React from 'react';
import type { Metadata, Viewport } from 'next';
import ServiceWorkerRegistration from './ServiceWorkerRegistration';

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'רשימת קניות חכמה',
  description: 'רשימת קניות משותפת חכמה למשפחה',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'קניות'
  },
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-192.svg'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="קניות" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Suppress browser extension errors
            window.addEventListener('error', function(e) {
              if (e.message && e.message.includes('message channel closed')) {
                e.preventDefault();
                return false;
              }
            });
            window.addEventListener('unhandledrejection', function(e) {
              if (e.reason && e.reason.message && e.reason.message.includes('message channel closed')) {
                e.preventDefault();
                return false;
              }
            });
          `
        }} />
      </head>
      <body className="bg-[#F8F9FE] text-slate-900">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
