'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getDailyInvoices } from '@/lib/data';
import type { Invoice } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Receipt, DollarSign, CalendarCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'مدفوعة':
      return 'secondary';
    case 'غير مدفوعة':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function SalesHistoryPage() {
  const [dailyInvoices, setDailyInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
        const invoices = await getDailyInvoices();
        setDailyInvoices(invoices);
        setLastUpdated(new Date());
    } catch(e) {
        toast({ variant: 'destructive', title: 'فشل في جلب سجل المبيعات' });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    setIsClient(true);
  }, []);
  
  const dailyTotal = dailyInvoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <Receipt className="h-7 w-7 text-primary" />
            سجل المبيعات اليومية
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">متابعة دقيقة لكافة الفواتير والمبيعات اليومية في الوقت الفعلي</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right glass-panel px-4 py-2 rounded-2xl border-white/20">
                 {loading ? <Skeleton className="h-7 w-32" /> : <p className="font-bold text-xl text-primary">{dailyTotal.toLocaleString('ar-LY', { style: 'currency', currency: 'LYD' })}</p>}
                 <p className="text-[11px] text-muted-foreground font-medium">إجمالي المبيعات اليومية</p>
            </div>
            <Button onClick={fetchInvoices} variant="outline" size="icon" disabled={loading} className="glass-pill h-11 w-11 rounded-xl">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>
      </div>

      <Card className="glass-panel p-2 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-lg font-bold font-headline flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            الفواتير الصادرة اليوم
          </CardTitle>
          <CardDescription className="text-xs">
            {lastUpdated && isClient && !loading && (
                <span className="block text-xs text-muted-foreground">
                    آخر تحديث تلقائي: {lastUpdated.toLocaleTimeString('ar-LY')}
                </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="glass-table">
            <TableHeader>
              <TableRow className="border-b border-white/15">
                <TableHead className="font-bold text-xs">رقم الفاتورة</TableHead>
                <TableHead className="font-bold text-xs">هاتف العميل</TableHead>
                <TableHead className="font-bold text-xs">الوقت</TableHead>
                <TableHead className="font-bold text-xs">عدد الأصناف</TableHead>
                <TableHead className="font-bold text-xs">الإجمالي</TableHead>
                <TableHead className="font-bold text-xs">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={6}><Skeleton className="h-8 w-full rounded-xl" /></TableCell>
                        </TableRow>
                    ))
                ) : dailyInvoices.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-semibold">
                            لا توجد فواتير صادرة اليوم بعد.
                        </TableCell>
                    </TableRow>
                ) : (
                    dailyInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-primary/5 transition-colors border-b border-white/10">
                      <TableCell className="font-bold font-mono text-sm">{invoice.id.slice(0, 8)}</TableCell>
                      <TableCell className="font-mono text-xs">{invoice.customerPhone || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {isClient && invoice.date
                          ? new Date(invoice.date).toLocaleTimeString('ar-LY', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {invoice.items.reduce((sum, i) => sum + i.quantity, 0)} عناصر
                      </TableCell>
                      <TableCell className="font-bold text-sm text-primary">
                        {invoice.total.toLocaleString('ar-LY', {
                          style: 'currency',
                          currency: 'LYD',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(invoice.status)} className="glass-pill text-xs px-2.5 py-0.5">
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
