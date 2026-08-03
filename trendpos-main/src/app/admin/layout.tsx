
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import {
  LogOut,
  LayoutDashboard,
  CreditCard,
  Tags,
  ArrowLeft,
  Package,
  BarChart,
  Receipt,
  Settings,
  Users,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const menuItems = [
  { href: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/cards', label: 'إدارة البطاقات', icon: CreditCard },
  { href: '/admin/categories', label: 'إدارة الفئات', icon: Tags },
  { href: '/admin/facebook-packages', label: 'باقات فيسبوك', icon: Package },
  { href: '/admin/users', label: 'إدارة المستخدمين', icon: Users },
  { href: '/admin/reports', label: 'التقارير', icon: BarChart },
  { href: '/admin/invoices', label: 'أرشيف الفواتير', icon: Receipt },
  { href: '/admin/usdt-sales', label: 'مبيعات USDT', icon: DollarSign },
  { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication or SSO token from Shipping System
    const urlParams = new URLSearchParams(window.location.search);
    const isSSO = urlParams.get('sso') === 'admin';
    if (isSSO) {
      sessionStorage.setItem('adminAuthenticated', 'true');
      sessionStorage.setItem('userRole', 'admin');
    }

    const authStatus = isSSO || sessionStorage.getItem('adminAuthenticated') === 'true';
    const userRole = sessionStorage.getItem('userRole') || (isSSO ? 'admin' : 'cashier');

    // If user is Cashier, block access to /admin pages and redirect to /order
    if (userRole === 'cashier' && pathname !== '/admin/login') {
      setIsAuthenticated(false);
      router.replace('/order');
      return;
    }

    setIsAuthenticated(authStatus);
    if (!authStatus && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    router.replace('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
      // You can return a loader here
      return <div className="flex h-screen w-full items-center justify-center">جاري التحميل...</div>;
  }

  if (!isAuthenticated) {
    // This will be handled by the redirect, but as a fallback
    return null;
  }
  
  const getActiveState = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-l border-white/20 dark:border-white/10 bg-background/50 backdrop-blur-2xl shadow-2xl" side="right">
        <SidebarHeader className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 glass-panel p-3 rounded-2xl border-white/20 shadow-sm">
            <div className="w-10 h-10 bg-white/90 border border-primary/30 rounded-xl flex items-center justify-center p-1 shrink-0 shadow-xs">
              <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
            </div>
            <div className="flex flex-col text-right">
              <span className="font-extrabold text-base font-headline leading-tight text-primary">
                USDT STORE
              </span>
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider">
                نظام المبيعات المباشرة
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {menuItems.map((item) => (
               <SidebarMenuItem key={item.href}>
                 <SidebarMenuButton
                   asChild
                   isActive={getActiveState(item.href)}
                   tooltip={{ children: item.label, side: 'left', align: 'center' }}
                   className="h-12 justify-start rounded-xl transition-all duration-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/20 data-[active=true]:to-accent/20 data-[active=true]:text-primary data-[active=true]:font-bold data-[active=true]:border data-[active=true]:border-primary/30"
                 >
                   <Link href={item.href} className="flex items-center gap-3">
                     <item.icon className="h-5 w-5" />
                     <span className="text-base font-medium">{item.label}</span>
                   </Link>
                 </SidebarMenuButton>
               </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-white/10">
          <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: 'العودة للتطبيق', side: 'left', align: 'center' }}
                  className="h-12 justify-start rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <Link href="/order" className="flex items-center gap-3">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-base font-medium">العودة للتطبيق</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip={{ children: 'تسجيل الخروج', side: 'left', align: 'center' }}
                  className="h-12 justify-start rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="text-base font-medium">تسجيل الخروج</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col w-full">
         <header className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-xl border-b border-white/20 dark:border-white/10 h-20 shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-headline">لوحة تحكم المدير</h1>
              <span className="glass-pill text-xs px-2.5 py-1 rounded-full text-primary font-bold">Admin</span>
            </div>
             <Button variant="outline" onClick={handleLogout} className="glass-pill rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all">
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
            </Button>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
            {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
