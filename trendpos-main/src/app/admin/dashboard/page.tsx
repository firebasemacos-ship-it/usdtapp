'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SalesChart } from "@/components/sales-chart";
import { DollarSign, ShoppingBag, CreditCard, Wallet, TrendingUp, BarChart, FileText, FileWarning, Sparkles, LayoutDashboard } from "lucide-react";
import { getTotalPostRevenue, getTotalPostDebt, getPaidPostsCount, getUnpaidPostsCount, getPostProfit } from "@/lib/dashboard-data";
import { getCardRevenue, getCardDebt, getTotalProfit, getTotalSalesCount } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const [cardRevenue, setCardRevenue] = useState(0);
  const [cardDebt, setCardDebt] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);

  const [postRevenue, setPostRevenue] = useState(0);
  const [postDebt, setPostDebt] = useState(0);
  const [paidPostsCount, setPaidPostsCount] = useState(0);
  const [unpaidPostsCount, setUnpaidPostsCount] = useState(0);
  const [postProfit, setPostProfit] = useState(0);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [
                fetchedCardRevenue,
                fetchedCardDebt,
                fetchedTotalProfit,
                fetchedTotalSalesCount,
                fetchedPostRevenue,
                fetchedPostDebt,
                fetchedPaidPostsCount,
                fetchedUnpaidPostsCount,
                fetchedPostProfit,
            ] = await Promise.all([
                getCardRevenue(),
                getCardDebt(),
                getTotalProfit(),
                getTotalSalesCount(),
                getTotalPostRevenue(),
                getTotalPostDebt(),
                getPaidPostsCount(),
                getUnpaidPostsCount(),
                getPostProfit(),
            ]);
            setCardRevenue(fetchedCardRevenue);
            setCardDebt(fetchedCardDebt);
            setTotalProfit(fetchedTotalProfit);
            setTotalSalesCount(fetchedTotalSalesCount);
            setPostRevenue(fetchedPostRevenue);
            setPostDebt(fetchedPostDebt);
            setPaidPostsCount(fetchedPaidPostsCount);
            setUnpaidPostsCount(fetchedUnpaidPostsCount);
            setPostProfit(fetchedPostProfit);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchDashboardData();
  }, []);
  
  const totalOverallRevenue = cardRevenue + postRevenue;
  const totalOverallDebt = cardDebt + postDebt;
  const totalOverallProfit = totalProfit + postProfit;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
          <LayoutDashboard className="h-7 w-7 text-primary" />
          لوحة التحكم الشاملة
        </h1>
      </div>
      
      <Card className="glass-panel p-2 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="font-headline text-lg font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            الملخص الشامل للنظام
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-2 grid gap-4 md:grid-cols-3">
           <div className="p-5 glass-card rounded-2xl border-white/20 flex items-center gap-4 hover:scale-[1.02] transition-transform">
            <div className="bg-emerald-500/20 p-3.5 rounded-2xl text-emerald-500">
                <DollarSign className="h-7 w-7" />
            </div>
            <div>
                 <p className="text-xs font-semibold text-muted-foreground">إجمالي الإيرادات (الجميع)</p>
                 {loading ? <Skeleton className="h-8 w-32 mt-1" /> : <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-headline">{totalOverallRevenue.toLocaleString()} ل.د</p>}
            </div>
           </div>
           <div className="p-5 glass-card rounded-2xl border-white/20 flex items-center gap-4 hover:scale-[1.02] transition-transform">
            <div className="bg-amber-500/20 p-3.5 rounded-2xl text-amber-500">
                <TrendingUp className="h-7 w-7" />
            </div>
             <div>
                <p className="text-xs font-semibold text-muted-foreground">إجمالي صافي الأرباح</p>
                {loading ? <Skeleton className="h-8 w-32 mt-1" /> : <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-headline">{totalOverallProfit.toLocaleString()} ل.د</p>}
             </div>
           </div>
           <div className="p-5 glass-card rounded-2xl border-white/20 flex items-center gap-4 hover:scale-[1.02] transition-transform">
            <div className="bg-rose-500/20 p-3.5 rounded-2xl text-rose-500">
                <CreditCard className="h-7 w-7" />
            </div>
            <div>
                 <p className="text-xs font-semibold text-muted-foreground">إجمالي الديون القائمة</p>
                 {loading ? <Skeleton className="h-8 w-32 mt-1" /> : <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-headline">{totalOverallDebt.toLocaleString()} ل.د</p>}
            </div>
           </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div>
            <h2 className="text-xl font-bold font-headline mb-3 text-foreground">مبيعات بطاقات التعبئة</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card rounded-2xl border-white/20 p-4">
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground">إجمالي الإيرادات</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-xl font-bold font-headline text-foreground">{cardRevenue.toLocaleString()} ل.د</div>}
                        <p className="text-[11px] text-muted-foreground mt-1">البطاقات المدفوعة</p>
                    </CardContent>
                </Card>
                <Card className="glass-card rounded-2xl border-white/20 p-4">
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground">الديون المستحقة</CardTitle>
                        <CreditCard className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-xl font-bold font-headline text-rose-500">{cardDebt.toLocaleString()} ل.د</div>}
                        <p className="text-[11px] text-muted-foreground mt-1">بطاقات آجل</p>
                    </CardContent>
                </Card>
                <Card className="glass-card rounded-2xl border-white/20 p-4">
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground">صافي الأرباح</CardTitle>
                        <TrendingUp className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-xl font-bold font-headline text-emerald-600 dark:text-emerald-400">{totalProfit.toLocaleString()} ل.د</div>}
                        <p className="text-[11px] text-muted-foreground mt-1">بعد استقطاع التكاليف</p>
                    </CardContent>
                </Card>
                <Card className="glass-card rounded-2xl border-white/20 p-4">
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground">عدد المبيعات</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-xl font-bold font-headline text-foreground">{totalSalesCount} عملية</div>}
                        <p className="text-[11px] text-muted-foreground mt-1">بطاقة مبيعة</p>
                    </CardContent>
                </Card>
            </div>
        </div>
        
        <div>
            <h2 className="text-xl font-bold font-headline mb-3 text-foreground">المنشورات والإعلانات الممولة</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card className="glass-card rounded-2xl border-white/20 p-4">
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground">إيرادات المنشورات</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-xl font-bold font-headline text-foreground">{postRevenue.toLocaleString()} ل.د</div>}
                        <p className="text-[11px] text-muted-foreground mt-1">المنشورات المسددة</p>
                    </CardContent>
                </Card>
                <Card className="glass-card rounded-2xl border-white/20 p-4">
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground">أرباح المنشورات</CardTitle>
                        <TrendingUp className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-xl font-bold font-headline text-emerald-600 dark:text-emerald-400">{postProfit.toLocaleString()} ل.د</div>}
                        <p className="text-[11px] text-muted-foreground mt-1">هامش الأرباح</p>
                    </CardContent>
                </Card>
                <Card className="glass-card rounded-2xl border-white/20 p-4">
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground">الديون القائمة</CardTitle>
                        <CreditCard className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-xl font-bold font-headline text-rose-500">{postDebt.toLocaleString()} ل.د</div>}
                        <p className="text-[11px] text-muted-foreground mt-1">غير مسددة</p>
                    </CardContent>
                </Card>
                <Card className="glass-card rounded-2xl border-white/20 p-4">
                    <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground">إحصاء المنشورات</CardTitle>
                        <FileText className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? <Skeleton className="h-8 w-1/2" /> : 
                            <div className="text-xl font-bold font-headline">
                                <span className="text-emerald-600">{paidPostsCount} مسدد</span> / <span className="text-rose-500">{unpaidPostsCount} معلق</span>
                            </div>
                        }
                        <p className="text-[11px] text-muted-foreground mt-1">إجمالي الحالات</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>

      <Card className="glass-panel p-2 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="font-headline text-lg font-bold">رسم بياني لنشاط المبيعات</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {loading ? <Skeleton className="h-[250px] w-full rounded-2xl" /> : <SalesChart />}
        </CardContent>
      </Card>
    </div>
  );
}