import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'USDT STORE - نظام المبيعات المباشرة',
  description: 'نظام المبيعات المباشرة USDT STORE لإدارة نقاط البيع والتجارة الرقمية.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body 
        suppressHydrationWarning
        className={cn(
          'font-body antialiased min-h-screen relative overflow-x-hidden',
          "bg-slate-950/5 dark:bg-slate-950 text-foreground"
        )}>
        {/* Ambient Glassmorphism Glow Background Orbs */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#1aa0a1]/20 blur-[130px] dark:bg-[#1aa0a1]/25 animate-pulse" />
          <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-teal-500/20 blur-[150px] dark:bg-teal-600/25" />
          <div className="absolute -bottom-32 left-1/4 w-[550px] h-[550px] rounded-full bg-cyan-500/15 blur-[140px] dark:bg-cyan-600/20" />
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
