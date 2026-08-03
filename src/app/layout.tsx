import type { Metadata } from "next";
import { Cairo } from 'next/font/google';
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Polyfill localStorage for SSR if needed
if (typeof window === 'undefined') {
  const noop = () => { };
  const storageMock = {
    getItem: () => null,
    setItem: noop,
    removeItem: noop,
    clear: noop,
    length: 0,
    key: () => null,
  };

  try {
    if (typeof global.localStorage === 'undefined' || typeof global.localStorage.getItem !== 'function') {
      Object.defineProperty(global, 'localStorage', {
        value: storageMock,
        writable: true,
        configurable: true
      });
    }
  } catch (e) {
    console.error('Failed to polyfill localStorage:', e);
  }
}


import { Tajawal, Cairo } from 'next/font/google';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-tajawal',
  fallback: ['system-ui', 'sans-serif'],
});

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-cairo',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: "USDT STORE | منظومة إدارة الخدمات والمبيعات المباشرة",
  description: "منظومة USDT STORE الحديثة لإدارة المبيعات والخدمات المالية والفوترة والديون",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${cairo.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-tajawal font-medium antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
