'use client';

import { useEffect } from 'react';

export default function RedirectToTrendPOS() {
  useEffect(() => {
    const salesUrl = process.env.NEXT_PUBLIC_SALES_SYSTEM_URL || 
      (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') 
        ? 'https://usdtapp-y4at.vercel.app' 
        : 'http://localhost:9005');
    window.location.href = salesUrl;
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-tajawal dir-rtl" dir="rtl">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-[#1aa0a1] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold">جاري التوجيه إلى نظام المبيعات المباشرة المستقل (TrendPOS)...</p>
      </div>
    </div>
  );
}
