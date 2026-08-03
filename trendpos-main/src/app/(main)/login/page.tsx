'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { Lock, User, Sparkles } from 'lucide-react';
import { verifyUser } from '@/lib/users-data';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const [logoClickCount, setLogoClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('authenticated') === 'true') {
      router.replace('/order');
    }
  }, [router]);
  
  useEffect(() => {
    if (logoClickCount === 3) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      setLogoClickCount(0);
      router.push('/admin/login');
    }
  }, [logoClickCount, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await verifyUser(username, password);

      if (user) {
        sessionStorage.setItem('authenticated', 'true');
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('userRole', user.role);

        if (user.role === 'admin') {
          sessionStorage.setItem('adminAuthenticated', 'true');
          toast({
            title: 'تم تسجيل دخول المدير بنجاح',
            description: `أهلاً بك يا ${user.username} في لوحة التحكم الإدارية.`,
          });
          router.replace('/admin/dashboard');
        } else {
          sessionStorage.removeItem('adminAuthenticated');
          toast({
            title: 'تم تسجيل دخول الكاشير بنجاح',
            description: `أهلاً بك يا ${user.username} في واجهة الكاشير ونقطة البيع.`,
          });
          router.replace('/order');
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'بيانات الاعتماد غير صحيحة',
          description: 'الرجاء التحقق من اسم المستخدم وكلمة المرور.',
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ أثناء تسجيل الدخول',
        description: 'الرجاء المحاولة مرة أخرى.',
      });
      setIsLoading(false);
    }
  };
  
  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setLogoClickCount(0);
    }, 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Glass card container */}
      <Card className="w-full max-w-md glass-panel p-2 shadow-2xl rounded-3xl border border-white/30 dark:border-white/10 relative z-10 transition-all duration-300">
        <CardHeader className="text-center space-y-3 pb-6 pt-8">
          <div className="flex justify-center mb-2" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <Icons.logo className="w-48 drop-shadow-md hover:scale-105 transition-transform" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline tracking-wide flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            تسجيل الدخول للنظام
          </CardTitle>
          <CardDescription className="text-sm font-medium">الرجاء إدخال بياناتك للوصول إلى نقطة البيع.</CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5 px-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-semibold text-sm">اسم المستخدم</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="أدخل اسم المستخدم..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-10 h-12 glass-input rounded-xl text-base"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-sm">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-12 glass-input rounded-xl text-base"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-6 pb-8 px-6">
            <Button type="submit" className="w-full h-12 glass-glow-button text-white text-base font-bold rounded-xl" disabled={isLoading}>
              {isLoading ? 'جاري التحقق...' : 'دخول للنظام'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
