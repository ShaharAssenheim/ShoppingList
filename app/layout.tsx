import './globals.css';
import React from 'react';
import ServiceWorkerRegistration from './ServiceWorkerRegistration';

export const metadata = {
  title: 'רשימת קניות חכמה',
  description: 'רשימת קניות משותפת חכמה למשפחה',
  manifest: '/manifest.json',
  themeColor: '#6366f1',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
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
      </head>
      <body className="bg-[#F8F9FE] text-slate-900">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
