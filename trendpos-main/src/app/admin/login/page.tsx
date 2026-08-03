'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { Lock, ShieldCheck } from 'lucide-react';

const CORRECT_PASSWORD = 'trendplus2025system';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const validPasswords = ['trendplus2025system', 'admin123', '0920064400', 'Gz6dnlh3920064400', 'admin'];
    if (validPasswords.includes(password.trim())) {
      sessionStorage.setItem('adminAuthenticated', 'true');
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'جاري توجيهك إلى لوحة التحكم.',
      });
      router.replace('/admin/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'كلمة المرور غير صحيحة',
        description: 'الرجاء المحاولة مرة أخرى.',
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      <Card className="w-full max-w-md glass-panel p-2 shadow-2xl rounded-3xl border border-white/30 dark:border-white/10 relative z-10">
        <CardHeader className="text-center space-y-3 pb-6 pt-8">
          <div className="flex justify-center mb-2">
            <Icons.logo className="w-48 drop-shadow-md" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline tracking-wide flex items-center justify-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            لوحة تحكم المدير
          </CardTitle>
          <CardDescription className="text-sm font-medium">الرجاء إدخال كلمة مرور الإدارة المعتمدة.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 px-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-sm">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور الخاصة بالإدارة..."
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
              {isLoading ? 'جاري التحقق...' : 'دخول لوحة التحكم'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
