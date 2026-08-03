'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Ship, Phone, Loader2, ArrowLeft, Lock, PhoneCall, Plane, ShieldCheck, Sparkles, Eye, EyeOff, Coins, DollarSign, MapPin } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import logo from '@/app/assets/logo.png';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { getUserByPhone } from "@/lib/actions";
import { motion } from 'framer-motion';

const Logo = ({ onClick }: { onClick: () => void }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-32 h-32 mb-6 cursor-pointer mx-auto bg-slate-900 border border-white/20 rounded-3xl p-3 flex items-center justify-center shadow-xl shadow-[#1aa0a1]/25"
        onClick={onClick}
    >
        <Image
            src={logo}
            alt="USD STORE Logo"
            width={90}
            height={90}
            className="object-contain drop-shadow"
            priority
        />
    </motion.div>
);

export default function LoginPage() {
    const [logoClickCount, setLogoClickCount] = useState(0);
    const [titleClickCount, setTitleClickCount] = useState(0);
    const router = useRouter();
    const { toast } = useToast();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }, []);

    useEffect(() => {
        if (logoClickCount === 3) {
            router.push('/admin/login');
        }

        let timer: NodeJS.Timeout;
        if (logoClickCount > 0) {
            timer = setTimeout(() => setLogoClickCount(0), 1500);
        }

        return () => clearTimeout(timer);
    }, [logoClickCount, router]);

    useEffect(() => {
        if (titleClickCount === 3) {
            router.push('/representative/login');
        }

        let timer: NodeJS.Timeout;
        if (titleClickCount > 0) {
            timer = setTimeout(() => setTitleClickCount(0), 1500);
        }

        return () => clearTimeout(timer);
    }, [titleClickCount, router]);

    const handleLogoClick = () => {
        setLogoClickCount(prev => prev + 1);
    };

    const handleTitleClick = () => {
        setTitleClickCount(prev => prev + 1);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || !password) {
            toast({
                title: "خطأ في الإدخال",
                description: "الرجاء إدخال رقم الهاتف وكلمة المرور.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            const user = await getUserByPhone(phone);

            if (user && user.password === password) {
                toast({
                    title: "تم تسجيل الدخول بنجاح",
                    description: `مرحباً بك، ${user.name}`,
                });
                localStorage.setItem('loggedInUser', JSON.stringify({ id: user.id, type: 'user' }));
                router.push('/dashboard');
            } else {
                toast({
                    title: "فشل تسجيل الدخول",
                    description: "رقم الهاتف أو كلمة المرور غير صحيحة.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            toast({
                title: "خطأ في الخادم",
                description: "حدث خطأ أثناء محاولة تسجيل الدخول. الرجاء المحاولة مرة أخرى.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-tajawal dir-rtl" dir="rtl" suppressHydrationWarning>
            
            {/* Left Panel - Visuals & Branding (Desktop) */}
            <div className="hidden lg:flex w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden p-12 select-none">
                
                {/* Ambient Background Glows */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -top-24 -left-24 w-96 h-96 bg-[#1aa0a1]/30 rounded-full blur-[110px]"
                    />
                    <motion.div
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.45, 0.2] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/25 rounded-full blur-[130px]"
                    />
                </div>

                {/* Floating Icons Background */}
                <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                    <motion.div
                        animate={{ y: [-15, 15, -15], rotate: [5, -5, 5] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-16 right-16"
                    >
                        <Coins className="w-16 h-16 text-[#1aa0a1]" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [15, -15, 15], rotate: [-5, 5, -5] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-20 left-16"
                    >
                        <DollarSign className="w-20 h-20 text-teal-400" />
                    </motion.div>
                </div>

                {/* Main Branding Card */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center max-w-lg"
                >
                    {/* Logo with Ambient Glow */}
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        onClick={handleLogoClick}
                        className="cursor-pointer inline-block group"
                    >
                        <div className="relative w-40 h-40 bg-slate-900/90 border border-white/20 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-[#1aa0a1]/30 backdrop-blur-xl p-4">
                            <Image
                                src={logo}
                                alt="USD STORE Logo"
                                width={110}
                                height={110}
                                className="object-contain drop-shadow"
                                priority
                            />
                        </div>
                    </motion.div>

                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
                        USD STORE
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed max-w-md mx-auto font-normal mb-10">
                        منظومتك المتكاملة للمبيعات والخدمات والتحويلات المالية الشفافة والأمنة.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-5 mt-8">
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg text-center group"
                        >
                            <div className="w-12 h-12 bg-[#1aa0a1]/15 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#1aa0a1]/30 transition-colors">
                                <DollarSign className="w-6 h-6 text-[#1aa0a1]" />
                            </div>
                            <h3 className="text-white font-bold text-base mb-1">خدمات ماليّة</h3>
                            <p className="text-xs text-slate-400">حسابات وأسعار فورية بالدولار والدينار</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -4 }}
                            className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg text-center group"
                        >
                            <div className="w-12 h-12 bg-[#1aa0a1]/15 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#1aa0a1]/30 transition-colors">
                                <Package className="w-6 h-6 text-[#1aa0a1]" />
                            </div>
                            <h3 className="text-white font-bold text-base mb-1">مبيعات وتوصيل</h3>
                            <p className="text-xs text-slate-400">إدارة ومتابعة دقيقة لطلباتك</p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Right Panel - Form Area */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative bg-white">
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#1aa0a1]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="w-full max-w-md mx-auto my-auto space-y-7 relative z-10">
                    
                    {/* Header */}
                    <div className="text-right space-y-2">
                        <div className="lg:hidden flex justify-center mb-6">
                            <Logo onClick={handleLogoClick} />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-[#1aa0a1] text-xs font-semibold mb-3 border border-teal-100">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                بوابة USD STORE الآمنة
                            </div>
                            <h2
                                onClick={handleTitleClick}
                                className="text-3xl font-extrabold text-slate-900 tracking-tight cursor-pointer select-none"
                            >
                                تسجيل الدخول
                            </h2>
                            <p className="text-slate-500 text-sm mt-1.5 font-normal">
                                أدخل رقم الهاتف وكلمة المرور للمتابعة إلى حسابك
                            </p>
                        </motion.div>
                    </div>

                    {/* Form */}
                    <motion.form
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >
                        <div className="space-y-4">
                            {/* Phone Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 block pr-1">رقم الهاتف</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1aa0a1] transition-colors">
                                        <PhoneCall className="h-5 w-5" />
                                    </div>
                                    <Input
                                        dir="rtl"
                                        type="tel"
                                        placeholder="09XXXXXXXX"
                                        className="h-12 pr-11 text-right bg-slate-50/80 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-[#1aa0a1] focus:ring-4 focus:ring-[#1aa0a1]/15 transition-all font-medium"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 block pr-1">كلمة المرور</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1aa0a1] transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <Input
                                        dir="rtl"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-12 pr-11 pl-10 text-right bg-slate-50/80 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-[#1aa0a1] focus:ring-4 focus:ring-[#1aa0a1]/15 transition-all font-medium"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-[#1aa0a1] via-teal-600 to-teal-500 hover:from-[#189192] hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-[#1aa0a1]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#1aa0a1]/35 active:scale-[0.99] text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>جاري التحقق...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <span>دخول آمن إلى USD STORE</span>
                                    <ArrowLeft className="h-5 w-5" />
                                </div>
                            )}
                        </Button>
                    </motion.form>

                    {/* Quick Access Cards */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="pt-2 grid grid-cols-2 gap-4"
                    >
                        <Link href="/dashboard/track-shipment" className="group">
                            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#1aa0a1]/40 hover:shadow-lg hover:shadow-[#1aa0a1]/5 transition-all duration-300 text-center space-y-1.5 h-full">
                                <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center mx-auto group-hover:bg-[#1aa0a1] group-hover:text-white transition-colors">
                                    <Ship className="w-5 h-5 text-[#1aa0a1] group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-bold text-sm text-slate-800">تتبع شحنتك</h3>
                                <p className="text-[11px] text-slate-400">متابعة الفواتير والطلبات</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/calculate-shipment" className="group">
                            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300 text-center space-y-1.5 h-full">
                                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-[#1aa0a1] group-hover:text-white transition-colors">
                                    <Package className="w-5 h-5 text-[#1aa0a1] group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-bold text-sm text-slate-800">حساب التكلفة</h3>
                                <p className="text-[11px] text-slate-400">حساب أسعار الصرف والأوزان</p>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Support Contact */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="pt-2 text-center"
                    >
                        <a 
                            href="tel:0946691233" 
                            className="inline-flex items-center gap-2 text-xs font-bold text-[#1aa0a1] bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-full transition-colors border border-teal-100"
                        >
                            <Phone className="w-3.5 h-3.5" />
                            <span>الدعم الفني: <span dir="ltr">0946 691 233</span></span>
                        </a>
                    </motion.div>

                </div>

                {/* Bottom Footer & Address */}
                <footer className="text-center pt-6 text-xs text-slate-500 font-medium space-y-2">
                    {/* Address Pill Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-[11px] font-medium shadow-xs">
                        <MapPin className="w-3.5 h-3.5 text-[#1aa0a1] shrink-0" />
                        <span>الحدائق – شارع النفق – بعد حلواني الركن الغربي على اليسار</span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-medium">
                        جميع الحقوق محفوظة © لشركة هوية للتسويق الرقمي • <span className="text-slate-600 font-bold">USD STORE</span>
                    </p>
                </footer>

            </div>
        </div>
    );
}
