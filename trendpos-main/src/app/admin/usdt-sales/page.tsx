
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, User, TrendingUp, Trash2, MoreHorizontal, CheckCircle, CreditCard } from 'lucide-react';
import { addUsdtSale, getUsdtSales, deleteUsdtSale, updateUsdtSaleStatus } from '@/lib/usdt-sales-data';
import type { UsdtSale, UsdtSaleStatus } from '@/lib/types';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getSettings } from '@/lib/data';

type FilterPeriod = 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly';

const getStatusVariant = (status: UsdtSaleStatus) => {
  switch (status) {
    case 'مدفوعة': return 'secondary';
    case 'غير مدفوعة': return 'destructive';
    default: return 'outline';
  }
};


export default function UsdtSalesPage() {
    const [sales, setSales] = useState<UsdtSale[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [filter, setFilter] = useState<FilterPeriod>('all');
    const [exchangeRate, setExchangeRate] = useState(1);

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [usdtAmount, setUsdtAmount] = useState<number | ''>('');
    const [costPerUsdtUSD, setCostPerUsdtUSD] = useState<number | ''>('');
    const [sellingPricePerUsdtLYD, setSellingPricePerUsdtLYD] = useState<number | ''>('');
    

    const fetchSalesAndSettings = useCallback(async () => {
        setLoading(true);
        try {
            const [fetchedSales, settings] = await Promise.all([
                getUsdtSales(),
                getSettings()
            ]);
            setSales(fetchedSales);
            setExchangeRate(settings.exchangeRateUSD);
            if (sellingPricePerUsdtLYD === '') {
              setSellingPricePerUsdtLYD(settings.exchangeRateUSD);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'فشل في جلب البيانات' });
        } finally {
            setLoading(false);
        }
    }, [toast, sellingPricePerUsdtLYD]);

    useEffect(() => {
        fetchSalesAndSettings();
    }, [fetchSalesAndSettings]);

    const filteredSales = useMemo(() => {
        const now = new Date();
        if (filter === 'all') {
            return sales;
        }
        let startDate: Date;
        let endDate: Date = endOfDay(now);

        if (filter === 'daily') {
            startDate = startOfDay(now);
        } else if (filter === 'weekly') {
            startDate = startOfWeek(now);
        } else if (filter === 'monthly') {
            startDate = startOfMonth(now);
        } else if (filter === 'yearly') {
            startDate = startOfYear(now);
        } else {
             return sales;
        }
        
        return sales.filter(s => {
             if (!s.date) return false;
             const saleDate = new Date(s.date);
             return saleDate >= startDate && saleDate <= endDate;
        });

    }, [sales, filter]);

    const clearForm = () => {
        setCustomerName('');
        setUsdtAmount('');
        setCostPerUsdtUSD('');
        setSellingPricePerUsdtLYD(exchangeRate || '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const usdtAmountNum = Number(usdtAmount);
        const costPerUsdtUSDNum = Number(costPerUsdtUSD);
        const sellingPricePerUsdtLYDNum = Number(sellingPricePerUsdtLYD);

        if (!customerName || isNaN(usdtAmountNum) || usdtAmountNum <= 0 || isNaN(costPerUsdtUSDNum) || costPerUsdtUSDNum <= 0 || isNaN(sellingPricePerUsdtLYDNum) || sellingPricePerUsdtLYDNum <= 0) {
            toast({ variant: 'destructive', title: 'الرجاء ملء جميع الحقول بأرقام صحيحة' });
            return;
        }

        setIsSubmitting(true);
        try {
            const totalCostLYD = usdtAmountNum * costPerUsdtUSDNum * exchangeRate;
            const totalSaleLYD = usdtAmountNum * sellingPricePerUsdtLYDNum;
            const profitLYD = totalSaleLYD - totalCostLYD;
            
            const newSaleData: Omit<UsdtSale, 'id' | 'date' | 'status'> = {
                customerName,
                usdtAmount: usdtAmountNum,
                costPerUsdtUSD: costPerUsdtUSDNum,
                sellingPricePerUsdtLYD: sellingPricePerUsdtLYDNum,
                totalCostLYD,
                totalSaleLYD,
                profitLYD,
            };

            await addUsdtSale(newSaleData);
            toast({ title: 'تمت إضافة عملية البيع بنجاح' });
            clearForm();
            fetchSalesAndSettings(); // Refresh the list
        } catch (error) {
            console.error("Failed to add sale:", error);
            toast({ variant: 'destructive', title: 'فشل في إضافة عملية البيع' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (saleId: string) => {
        try {
            await deleteUsdtSale(saleId);
            toast({ title: 'تم حذف عملية البيع بنجاح' });
            fetchSalesAndSettings();
        } catch (error) {
            toast({ variant: 'destructive', title: 'فشل حذف عملية البيع' });
        }
    }
    
    const handleStatusUpdate = async (saleId: string, status: UsdtSaleStatus) => {
        try {
            await updateUsdtSaleStatus(saleId, status);
            toast({ title: 'تم تحديث حالة الدفع بنجاح' });
            fetchSalesAndSettings();
        } catch (error) {
             toast({ variant: 'destructive', title: 'فشل تحديث حالة الدفع' });
        }
    };

    const summary = useMemo(() => {
        const paidSales = sales.filter(s => s.status === 'مدفوعة');
        const unpaidSales = sales.filter(s => s.status === 'غير مدفوعة');
        
        const paidSummary = paidSales.reduce((acc, sale) => {
            acc.totalSales += sale.totalSaleLYD;
            acc.totalCost += sale.totalCostLYD;
            acc.totalProfit += sale.profitLYD;
            return acc;
        }, { totalSales: 0, totalCost: 0, totalProfit: 0 });

        const totalDebt = unpaidSales.reduce((acc, sale) => acc + sale.totalSaleLYD, 0);

        return { ...paidSummary, totalDebt };
    }, [sales]);
    
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('ar-LY', { style: 'currency', currency: 'LYD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold font-headline">مبيعات USDT</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الإيرادات (المدفوعة)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي صافي الربح (المدفوع)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalProfit)}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي التكلفة (المدفوعة)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold text-orange-500">{formatCurrency(summary.totalCost)}</div>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الديون (غير مدفوعة)</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold text-destructive">{formatCurrency(summary.totalDebt)}</div>}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>إضافة عملية بيع جديدة</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">اسم العميل</Label>
                                    <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} disabled={isSubmitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="usdtAmount">كمية USDT</Label>
                                    <Input id="usdtAmount" type="number" value={usdtAmount} onChange={(e) => setUsdtAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} disabled={isSubmitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="costPerUsdtUSD">سعر التكلفة (USD للوحدة)</Label>
                                    <Input id="costPerUsdtUSD" type="number" value={costPerUsdtUSD} onChange={(e) => setCostPerUsdtUSD(e.target.value === '' ? '' : parseFloat(e.target.value))} disabled={isSubmitting} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sellingPricePerUsdtLYD">سعر البيع (LYD للوحدة)</Label>
                                    <Input id="sellingPricePerUsdtLYD" type="number" value={sellingPricePerUsdtLYD} onChange={(e) => setSellingPricePerUsdtLYD(e.target.value === '' ? '' : parseFloat(e.target.value))} disabled={isSubmitting} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'جاري الإضافة...' : 'إضافة عملية البيع'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>سجل المبيعات</CardTitle>
                             <div className="flex flex-wrap items-center gap-2 pt-2">
                                 <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>الكل</Button>
                                 <Button size="sm" variant={filter === 'daily' ? 'default' : 'outline'} onClick={() => setFilter('daily')}>يومي</Button>
                                 <Button size="sm" variant={filter === 'weekly' ? 'default' : 'outline'} onClick={() => setFilter('weekly')}>اسبوعي</Button>
                                 <Button size="sm" variant={filter === 'monthly' ? 'default' : 'outline'} onClick={() => setFilter('monthly')}>شهري</Button>
                                 <Button size="sm" variant={filter === 'yearly' ? 'default' : 'outline'} onClick={() => setFilter('yearly')}>سنوي</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>العميل</TableHead>
                                        <TableHead>الكمية</TableHead>
                                        <TableHead>إجمالي البيع</TableHead>
                                        <TableHead>الربح</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>التاريخ</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        [...Array(3)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={7}><Skeleton className="h-6 w-full" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredSales.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                                لا توجد عمليات بيع لهذه الفترة.
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredSales.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-medium">{sale.customerName}</TableCell>
                                            <TableCell>{sale.usdtAmount.toLocaleString()} USDT</TableCell>
                                            <TableCell>{formatCurrency(sale.totalSaleLYD)}</TableCell>
                                            <TableCell className="text-green-600 font-medium">{formatCurrency(sale.profitLYD)}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(sale.status)}>{sale.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {sale.date ? format(new Date(sale.date), 'P', { locale: ar }) : '...'}
                                            </TableCell>
                                            <TableCell>
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {sale.status === 'غير مدفوعة' && (
                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(sale.id, 'مدفوعة')}>
                                                                <CheckCircle className="h-4 w-4 ml-2" />
                                                                تحديد كمدفوعة
                                                            </DropdownMenuItem>
                                                        )}
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                                    <Trash2 className="h-4 w-4 ml-2" />
                                                                    حذف
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                                                                    <AlertDialogDescription>سيتم حذف هذه العملية بشكل دائم. لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(sale.id)} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

    