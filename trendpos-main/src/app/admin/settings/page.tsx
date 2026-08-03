
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSettings, updateSettings } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign } from 'lucide-react';

export default function AdminSettingsPage() {
  const [exchangeRate, setExchangeRate] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const settings = await getSettings();
        setExchangeRate(settings.exchangeRateUSD);
      } catch (error) {
        toast({ variant: 'destructive', title: 'فشل في جلب الإعدادات' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    if (exchangeRate === '' || exchangeRate <= 0) {
      toast({ variant: 'destructive', title: 'الرجاء إدخال سعر صرف صحيح' });
      return;
    }
    setIsSaving(true);
    try {
      await updateSettings({ exchangeRateUSD: exchangeRate });
      toast({ title: 'تم تحديث الإعدادات بنجاح' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'فشل في تحديث الإعدادات' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold font-headline mb-6">إعدادات النظام</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>إعدادات سعر الصرف</CardTitle>
          <CardDescription>
            قم بتعيين سعر صرف الدولار الأمريكي مقابل الدينار الليبي. سيتم استخدام هذا السعر في حسابات الأرباح.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exchangeRate">سعر صرف الدولار (1 USD = ? LYD)</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    id="exchangeRate"
                    type="number"
                    placeholder="e.g., 5.40"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || '')}
                    className="pl-10"
                    />
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
