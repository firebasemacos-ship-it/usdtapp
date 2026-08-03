'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/app/assets/logo.png';
import { ShieldCheck, MapPin } from 'lucide-react';

export default function SplashScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('جاري تحميل النظام...');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');

    // Smooth Progress timer (3.2 seconds duration)
    const duration = 3200;
    const intervalTime = 30;
    const increment = 100 / (duration / intervalTime);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const nextVal = prev + increment;
        if (nextVal >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return nextVal;
      });
    }, intervalTime);

    // Subtle status updates
    const text1Timer = setTimeout(() => setLoadingText('الاتصال بالخادم الآمن...'), 900);
    const text2Timer = setTimeout(() => setLoadingText('تجهيز البيانات والخدمات...'), 1900);
    const text3Timer = setTimeout(() => setLoadingText('أهلاً بك، جاري التوجيه...'), 2600);

    // Redirect timer
    const redirectTimer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
          try {
            const userData = JSON.parse(loggedInUser);
            switch (userData.type) {
              case 'user':
                router.push('/dashboard');
                break;
              case 'admin':
                router.push('/admin/dashboard');
                break;
              case 'representative':
                router.push('/representative/dashboard');
                break;
              default:
                router.push('/login');
            }
          } catch (e) {
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      }
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(text1Timer);
      clearTimeout(text2Timer);
      clearTimeout(text3Timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-between bg-slate-950 text-white p-6 overflow-hidden select-none font-tajawal dir-rtl" dir="rtl" suppressHydrationWarning>

      {/* Soft Clean Ambient Light Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[450px] h-[450px] bg-[#1aa0a1]/25 rounded-full blur-[140px]"
        />
      </div>

      {/* Minimal Top Badge */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-8 z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1aa0a1] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1aa0a1]"></span>
          </span>
          <span className="text-xs font-medium text-slate-300">منظومة الخدمات والمبيعات المباشرة</span>
        </div>
      </motion.div>

      {/* Main Clean Center Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md my-auto w-full px-4">
        
        {/* Logo Card with Soft Backdrop Blur */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="relative mb-8"
        >
          {/* Subtle Backglow */}
          <div className="absolute inset-0 bg-[#1aa0a1] rounded-[2.5rem] blur-xl opacity-30 animate-pulse" />

          {/* Clean Glassmorphic Card */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 bg-slate-900/90 border border-white/15 rounded-[2.5rem] p-5 flex items-center justify-center backdrop-blur-2xl shadow-2xl">
            <Image
              src={logo}
              alt="USD STORE Logo"
              width={120}
              height={120}
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
        </motion.div>

        {/* System Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-2 mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            USD STORE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
            المنظومة الموحدة للمبيعات المباشرة والخدمات الذكية
          </p>
        </motion.div>

        {/* Razor-Thin Clean Dynamic Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full space-y-3"
        >
          {/* Progress Bar Line */}
          <div className="relative w-full h-1.5 bg-slate-900 border border-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#1aa0a1] to-teal-400 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeInOut' }}
            />
          </div>

          {/* Status Text & Percentage */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={loadingText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 text-slate-300"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#1aa0a1]" />
                {loadingText}
              </motion.span>
            </AnimatePresence>

            <span className="font-mono font-semibold text-slate-200">
              {Math.round(progress)}%
            </span>
          </div>
        </motion.div>

      </div>

      {/* Styled Footer with Integrated Address & Rights */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 text-center pb-5 text-xs text-slate-400 font-medium space-y-2 max-w-lg mx-auto"
      >
        {/* Address Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-white/10 text-slate-300 text-[11px] sm:text-xs backdrop-blur-md shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-[#1aa0a1] shrink-0" />
          <span>الحدائق – شارع النفق – بعد حلواني الركن الغربي على اليسار</span>
        </div>

        {/* Rights Notice */}
        <p className="text-[11px] text-slate-500 font-medium tracking-wide">
          جميع الحقوق محفوظة © لشركة هوية للتسويق الرقمي • <span className="text-slate-400 font-bold">USD STORE</span>
        </p>
      </motion.footer>

    </div>
  );
}
