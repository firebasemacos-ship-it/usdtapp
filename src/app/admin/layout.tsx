'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Home,
  Users,
  Briefcase,
  Bike,
  ShoppingCart,
  Users2,
  BarChart,
  MessageSquare,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Loader2,
  DollarSign,
  TrendingDown,
  HandCoins,
  Printer,
  Download,
  BookUser,
  Zap,
  ArrowRightLeft,
  Ship,
  BookOpen,
} from 'lucide-react';
import Image from 'next/image';
import logo from '@/app/assets/logo.png';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Manager } from '@/lib/types';
import { getManagerById } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';

// Shipping System Navigation Items (نظام الشحن والخدمات)
const navItems = [
  { href: '/admin/dashboard', icon: Home, label: 'لوحة التحكم الرئيسيّة', permissionId: 'dashboard' },
  { href: '/admin/instant-sales', icon: Zap, label: 'نظام المبيعات المباشرة (POS)', permissionId: 'instant_sales' },
  { href: '/admin/users', icon: Users, label: 'إدارة المستخدمين والزبائن', permissionId: 'users' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'إدارة الطلبيات والفواتير', permissionId: 'orders' },
  { href: '/admin/shipping-label', icon: Printer, label: 'إنشاء بوليصة شحن', permissionId: 'shipping_label' },
  { href: '/admin/representatives', icon: Bike, label: 'إدارة المندوبين', permissionId: 'representatives' },
  { href: '/admin/employees', icon: Briefcase, label: 'إدارة المدراء والصلاحيات', permissionId: 'employees' },
  { href: '/admin/temporary-users', icon: Users2, label: 'المستخدمين المؤقتين', permissionId: 'temporary_users' },
  { href: '/admin/deposits', icon: HandCoins, label: 'سجل العربون والإيداعات', permissionId: 'deposits' },
  { href: '/admin/expenses', icon: TrendingDown, label: 'إدارة المصروفات التشغيلية', permissionId: 'expenses' },
  { href: '/admin/creditors', icon: BookUser, label: 'إدارة الذمم والدائنين', permissionId: 'creditors' },
  { href: '/admin/financial-reports', icon: BarChart, label: 'التقارير المالية والديون', permissionId: 'financial_reports' },
  { href: '/admin/exchange-rate', icon: DollarSign, label: 'أسعار الصرف والشحن', permissionId: 'exchange_rate' },
  { href: '/admin/support-center', icon: MessageSquare, label: 'مركز الدعم والمحادثات', permissionId: 'support' },
  { href: '/admin/notifications', icon: Bell, label: 'إدارة الإشعارات', permissionId: 'notifications' },
  { href: '/admin/data-export', icon: Download, label: 'تصدير البيانات', permissionId: 'data_export' },
];

const getPageTitle = (pathname: string): string => {
  const pageTitles: { [key: string]: string } = {
    '/admin/dashboard': 'لوحة تحكم نظام الشحن والخدمات',
    '/admin/users': 'إدارة المستخدمين والزبائن',
    '/admin/employees': 'إدارة المدراء والمدخلين',
    '/admin/representatives': 'إدارة المندوبين والعهد',
    '/admin/orders': 'إدارة الطلبات والشحنات',
    '/admin/orders/add': 'إضافة/تعديل طلبية شحن',
    '/admin/shipping-label': 'إنشاء بوليصة شحن يدوية',
    '/admin/shipping-label/history': 'سجل البوليصات اليدوية',
    '/admin/temporary-users': 'إدارة الفواتير والمستخدمين المؤقتين',
    '/admin/temporary-users/add': 'إضافة فاتورة مجمعة',
    '/admin/financial-reports': 'التقارير المالية والديون',
    '/admin/deposits': 'سجل العربون والإيداعات',
    '/admin/expenses': 'إدارة المصروفات التشغيلية',
    '/admin/creditors': 'إدارة الذمم والدائنين',
    '/admin/support-center': 'مركز الدعم والمحادثات',
    '/admin/notifications': 'إدارة الإشعارات والتنبيهات',
    '/admin/data-export': 'تصدير واستيراد البيانات',
    '/admin/exchange-rate': 'أسعار الصرف وسعر الكيلو',
  };

  if (pathname.startsWith('/admin/users/print')) return 'طباعة كشف حساب المستخدم';
  if (pathname.startsWith('/admin/users/')) return 'الملف الشخصي للمستخدم';
  if (pathname.startsWith('/admin/representatives/')) return 'الملف الشخصي للمندوب';
  if (pathname.startsWith('/admin/creditors/print')) return 'طباعة كشف حساب الذمة';
  if (pathname.startsWith('/admin/creditors/')) return 'تفاصيل ملف الذمة';
  if (pathname.startsWith('/admin/orders/')) return 'تفاصيل طلبية الشحن';

  return pageTitles[pathname] || 'لوحة التحكم';
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentManager, setCurrentManager] = useState<Manager | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const user = localStorage.getItem('loggedInUser');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.type === 'admin') {
          setIsAuthenticated(true);
          const fetchManagerData = async () => {
            try {
              const manager = await getManagerById(userData.id);
              if (manager) {
                setCurrentManager(manager);
              } else {
                setCurrentManager({
                  id: userData.id || 'admin',
                  name: 'المدير العام',
                  username: 'admin',
                  password: 'admin123',
                  phone: '0900000000',
                  permissions: ['all']
                });
              }
            } catch (err) {
              setCurrentManager({
                id: 'admin',
                name: 'المدير العام',
                username: 'admin',
                password: 'admin123',
                phone: '0900000000',
                permissions: ['all']
              });
            }
          };
          fetchManagerData();
        } else {
          setIsAuthenticated(false);
          if (pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      } catch (e) {
        setIsAuthenticated(false);
        if (pathname !== '/admin/login') router.push('/admin/login');
      }
    } else {
      setIsAuthenticated(false);
      if (pathname !== '/admin/login') router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setCurrentManager(null);
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  const currentPageTitle = getPageTitle(pathname);

  const visibleNavItems = navItems.filter(item => {
    const isSuperAdmin = 
      !currentManager ||
      currentManager?.permissions?.includes('all') ||
      currentManager?.username?.toLowerCase().includes('admin') ||
      currentManager?.id === 'admin';
    if (isSuperAdmin) return true;
    return currentManager?.permissions?.includes(item.permissionId);
  });

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]" suppressHydrationWarning>
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (pathname === '/admin/login' || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground font-sans selection:bg-primary/30" dir="rtl" suppressHydrationWarning>

      <TooltipProvider>
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Floating Sidebar */}
        <aside
          className={cn(
            'fixed top-0 right-0 bottom-0 z-40 w-72 transition-transform duration-300 ease-in-out no-print',
            'bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 flex flex-col shadow-xl',
            isSidebarOpen ? 'translate-x-0' : 'translate-x-[110%]',
            'md:translate-x-0'
          )}
        >
          {/* Header Branding */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-primary shadow-md p-1.5">
                <Image src={logo} alt="Logo" width={28} height={28} className="object-contain" priority />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-foreground tracking-tight">
                  USD STORE
                </h1>
                <p className="text-[11px] font-semibold text-[#1aa0a1]">
                  نظام الشحن والخدمات
                </p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* System Switcher Button to TrendPOS (Unified Direct Sales App) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/instant-sales')}
              className="w-full h-10 justify-between bg-slate-900 border-slate-700 text-teal-400 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>الانتقال إلى نظام المبيعات (TrendPOS)</span>
              </span>
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Navigation List */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="px-3 pb-2.5 text-xs font-extrabold text-[#1aa0a1] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1aa0a1]" />
              أقسام نظام الشحن والخدمات
            </div>
            <ul className="space-y-1.5">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3.5 rounded-xl px-4 py-3 transition-all duration-200 group relative overflow-hidden text-sm font-bold',
                        isActive
                          ? 'text-white bg-gradient-to-r from-[#1aa0a1] via-teal-600 to-teal-700 shadow-md shadow-[#1aa0a1]/25 scale-[1.01]'
                          : 'text-slate-700 dark:text-slate-300 hover:text-[#1aa0a1] hover:bg-[#1aa0a1]/10'
                      )}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 z-10 relative transition-transform duration-200 shrink-0",
                        isActive ? "scale-110 text-white" : "group-hover:scale-110 text-[#1aa0a1]"
                      )}
                      />
                      <span className="z-10 relative truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Profile Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-[#1aa0a1] flex items-center justify-center text-xs font-bold text-white shrink-0">
                {currentManager?.name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{currentManager?.name || 'المدير العام'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{currentManager?.username || 'admin'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="md:pr-[18rem] transition-[padding] duration-300 h-full">
          <header className="sticky top-0 z-30 no-print">
            <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between px-6">
              <div className="flex items-center gap-4 h-16">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-foreground"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open sidebar</span>
                </Button>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1aa0a1]" />
                  <h1 className="font-extrabold text-base sm:text-lg text-foreground">{currentPageTitle}</h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full hover:bg-primary/20 text-foreground">
                      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>تغيير المظهر</p></TooltipContent>
                </Tooltip>
                <div className="w-px h-6 bg-border mx-1"></div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-destructive/20 hover:text-destructive text-muted-foreground">
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>تسجيل الخروج</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
}
