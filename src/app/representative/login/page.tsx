"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/logo.png";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getRepresentativeByUsername } from "@/lib/actions";
import { Bike, Loader2, Lock, User, Eye, EyeOff, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function RepresentativeLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "خطأ في الإدخال",
        description: "الرجاء إدخال اسم المستخدم وكلمة المرور.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const representative = await getRepresentativeByUsername(username);

      if (representative && representative.password === password) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً بك أيها المندوب، ${representative.name}`,
        });
        localStorage.setItem('loggedInUser', JSON.stringify({ id: representative.id, type: 'representative' }));
        router.push("/representative/dashboard");
      } else {
        toast({
          title: "فشل تسجيل الدخول",
          description: "اسم المستخدم أو كلمة المرور غير صحيحة.",
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
    <div
      className="relative flex flex-col min-h-screen items-center justify-center bg-slate-950 text-white p-6 overflow-hidden select-none font-tajawal dir-rtl"
      dir="rtl"
    >
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#1aa0a1]/30 rounded-full blur-[130px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-teal-500/25 rounded-full blur-[140px]"
        />
      </div>

      <main className="w-full max-w-md mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900/80 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl shadow-[#1aa0a1]/10 text-center"
        >
          {/* Logo Container */}
          <div className="relative w-28 h-28 mx-auto mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1aa0a1] to-teal-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-full h-full bg-slate-950 border border-white/15 rounded-3xl p-3 flex items-center justify-center shadow-xl">
              <Image src={logo} alt="USDT STORE Logo" width={70} height={70} className="object-contain drop-shadow" priority />
            </div>
            <div className="absolute -top-2 -right-2 p-1.5 bg-[#1aa0a1] rounded-full text-white shadow-md">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Badge & Title */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1aa0a1]/15 border border-[#1aa0a1]/30 text-teal-300 text-xs font-semibold mb-4">
            <Bike className="w-4 h-4 text-[#1aa0a1]" />
            بوابة المندوبين - USDT STORE
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-2">
            تسجيل دخول المندوب
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            أدخل معرف المندوب وكلمة المرور لمتابعة التوصيل والتحصيل
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 text-right">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block pr-1">رمز / اسم المندوب</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1aa0a1] transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <Input
                  dir="ltr"
                  type="text"
                  placeholder="REP1"
                  className="h-12 pr-11 text-right bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-[#1aa0a1] focus:ring-4 focus:ring-[#1aa0a1]/20 transition-all font-mono font-semibold"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block pr-1">كلمة المرور</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1aa0a1] transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  dir="rtl"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 pr-11 pl-10 text-right bg-slate-950/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-[#1aa0a1] focus:ring-4 focus:ring-[#1aa0a1]/20 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#1aa0a1] via-teal-600 to-teal-500 hover:from-[#189192] hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-[#1aa0a1]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#1aa0a1]/35 active:scale-[0.99] text-base mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>جاري التحقق...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>دخول المندوب</span>
                  <ArrowLeft className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Footer Back Link */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition-colors font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>العودة إلى بوابة الدخول الرئيسية</span>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
