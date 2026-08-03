
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, DollarSign, Receipt, TrendingUp, Printer } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, endOfYear, startOfYear } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { getAllInvoices, getTotalProfit } from '@/lib/data';
import type { Invoice, CardItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type Period = 'today' | 'this_month' | 'this_year' | 'custom';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'مدفوعة': return 'secondary';
        case 'غير مدفوعة': return 'destructive';
        default: return 'outline';
    }
};

export default function ReportsPage() {
    const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
    const [totalProfit, setTotalProfit] = useState(0);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [period, setPeriod] = useState<Period>('today');
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
    });
    const [isClient, setIsClient] = useState(false);
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [invoices, profit] = await Promise.all([
                getAllInvoices(),
                getTotalProfit()
            ]);
            setAllInvoices(invoices);
            setTotalProfit(profit);
        } catch (error) {
            toast({ variant: 'destructive', title: 'فشل في تحميل البيانات' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
        setIsClient(true);
    }, [fetchData]);

    const filteredInvoices = useMemo(() => {
        if (!date?.from) return [];
        const fromDate = startOfDay(date.from);
        const toDate = date.to ? endOfDay(date.to) : endOfDay(date.from);

        return allInvoices.filter(invoice => {
            if (!invoice.date) return false;
            const invoiceDate = new Date(invoice.date);
            return invoiceDate >= fromDate && invoiceDate <= toDate;
        });
    }, [allInvoices, date]);

    const stats = useMemo(() => {
        const paidInvoices = filteredInvoices.filter(inv => inv.status === 'مدفوعة');
        const totalRevenue = paidInvoices.reduce((acc, inv) => acc + (inv.finalAmount ?? inv.total), 0);
        
        return {
            totalRevenue,
            invoiceCount: filteredInvoices.length,
        };
    }, [filteredInvoices]);

    const handlePeriodChange = (newPeriod: Period) => {
        setPeriod(newPeriod);
        const now = new Date();
        if (newPeriod === 'today') {
            setDate({ from: startOfDay(now), to: endOfDay(now) });
        } else if (newPeriod === 'this_month') {
            setDate({ from: startOfMonth(now), to: endOfMonth(now) });
        } else if (newPeriod === 'this_year') {
            setDate({ from: startOfYear(now), to: endOfYear(now) });
        } else {
            setDate({ from: undefined, to: undefined });
        }
    };
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between noprint">
                <h1 className="text-3xl font-bold font-headline">التقارير</h1>
                <Button onClick={handlePrint} variant="outline">
                    <Printer className="ml-2 h-4 w-4" />
                    طباعة التقرير
                </Button>
            </div>


            <Card className="noprint">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>فلترة التقرير</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                             <Button variant={period === 'today' ? 'default' : 'outline'} onClick={() => handlePeriodChange('today')}>اليوم</Button>
                             <Button variant={period === 'this_month' ? 'default' : 'outline'} onClick={() => handlePeriodChange('this_month')}>هذا الشهر</Button>
                             <Button variant={period === 'this_year' ? 'default' : 'outline'} onClick={() => handlePeriodChange('this_year')}>هذه السنة</Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                            "w-[300px] justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "LLL dd, y", { locale: ar })} -{" "}
                                                    {format(date.to, "LLL dd, y", { locale: ar })}
                                                </>
                                            ) : (
                                                format(date.from, "LLL dd, y", { locale: ar })
                                            )
                                        ) : (
                                            <span>اختر تاريخ</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={(range) => { setDate(range); setPeriod('custom'); }}
                                        numberOfMonths={2}
                                        locale={ar}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الإيرادات (المدفوع)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('ar-LY', { style: 'currency', currency: 'LYD' })}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">صافي الربح (المدفوع)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold text-green-600">{totalProfit.toLocaleString('ar-LY', { style: 'currency', currency: 'LYD' })}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">عدد الفواتير</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.invoiceCount}</div>}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="print-title">
                        تقرير الفترة: {date?.from ? format(date.from, "PPP", { locale: ar }) : ''}
                        {date?.to && date.to.getTime() !== date.from?.getTime() ? ` - ${format(date.to, "PPP", { locale: ar })}` : ''}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>رقم الفاتورة</TableHead>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>الإجمالي</TableHead>
                                <TableHead>الحالة</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredInvoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        لا توجد فواتير لهذه الفترة.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredInvoices.map(invoice => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.id}</TableCell>
                                        <TableCell>
                                            {isClient && invoice.date ? format(new Date(invoice.date), 'Pp', { locale: ar }) : <Skeleton className="h-4 w-40" />}
                                        </TableCell>
                                        <TableCell>{invoice.total.toLocaleString('ar-LY', { style: 'currency', currency: 'LYD' })}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
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
