
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  History,
  LayoutGrid,
  TrendingUp,
  LogOut,
  Receipt,
  Search,
  Settings,
  HelpCircle,
  BookText,
  AlertTriangle,
  Archive,
  CreditCard,
  Lock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';
import { getSponsoredPosts, SponsoredPost } from '@/lib/dashboard-data';
import { getAllInvoices } from '@/lib/data';
import type { Invoice } from '@/lib/types';
import { addDays, isPast } from 'date-fns';

const menuItems = [
  { href: '/order', label: 'القائمة', icon: LayoutGrid },
  { href: '/sponsored-posts', label: 'تتبع المنشورات', icon: TrendingUp },
  { href: '/help', label: 'مركز المساعدة', icon: HelpCircle },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [username, setUsername] = useState('');

  const [posts, setPosts] = useState<SponsoredPost[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);


  useEffect(() => {
    // Check authentication status or SSO from admin login
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isSSO = urlParams?.get('sso') === 'admin' || sessionStorage.getItem('adminAuthenticated') === 'true';
    
    if (isSSO) {
      sessionStorage.setItem('authenticated', 'true');
      if (!sessionStorage.getItem('username')) {
        sessionStorage.setItem('username', 'admin');
      }
    }

    const authStatus = isSSO || sessionStorage.getItem('authenticated') === 'true';
    setIsAuthenticated(authStatus);

    if (!authStatus && pathname !== '/login') {
       // Allow access to login page
    }
    
    const storedUsername = sessionStorage.getItem('username') || (isSSO ? 'admin' : '');

    if (storedUsername) {
        setUsername(storedUsername);
    }


    if (authStatus) {
        getSponsoredPosts().then(setPosts);
        getAllInvoices().then(setInvoices);
    }

  }, [pathname, router]);

  const handleLogout = () => {
    sessionStorage.removeItem('authenticated');
    sessionStorage.removeItem('username');
    router.replace('/login');
  };
  
  const expiredPosts = useMemo(() => {
    if (!isAuthenticated) return [];
    return posts.filter(post => {
      if (post.status === 'نشط' && post.createdAt) {
        const createdAtDate = post.createdAt.toDate();
        const expiryDate = addDays(createdAtDate, post.days);
        return isPast(expiryDate);
      }
      return false;
    });
  }, [posts, isAuthenticated]);
  
  const totalDebt = useMemo(() => {
    if (!isAuthenticated) return 0;
    return invoices
      .filter(inv => inv.status === 'غير مدفوعة')
      .reduce((sum, inv) => sum + inv.total, 0);
  }, [invoices, isAuthenticated]);
  
  const debtLimitExceeded = totalDebt > 5000;

  const allNotifications = [
    ...expiredPosts,
    ...(debtLimitExceeded ? [{type: 'debt'}] : [])
  ];

  // Directly render login page if path is /login
  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
      return <div className="flex h-screen w-full items-center justify-center">جاري التحميل...</div>;
  }

  if (!isAuthenticated) {
      return (
          <div className="flex h-screen w-full flex-col items-center justify-center bg-muted/40 p-4 gap-4">
              <Icons.logo className="w-48" />
              <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
                  <Lock />
                  <span>يجب تسجيل الدخول</span>
              </div>
              <p className="text-muted-foreground">
                  لا يمكنك الوصول إلى هذه الصفحة. الرجاء تسجيل الدخول للمتابعة.
              </p>
              <Button asChild>
                  <Link href="/login">الذهاب إلى صفحة تسجيل الدخول</Link>
              </Button>
          </div>
      );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-l border-white/20 dark:border-white/10 bg-background/50 backdrop-blur-2xl shadow-2xl" side="right">
        <SidebarHeader className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 glass-panel p-3 rounded-2xl border-white/20 shadow-sm">
            <div className="w-10 h-10 bg-white/90 border border-primary/30 rounded-xl flex items-center justify-center p-1 shrink-0 shadow-xs">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
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
        <SidebarContent className="p-3 space-y-4">
          <div className="px-3 pt-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">القائمة الرئيسية</div>
          <SidebarMenu className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={{ children: item.label, side: 'left', align: 'center' }}
                    className={cn(
                      "h-12 justify-start rounded-2xl px-3.5 transition-all duration-300 font-medium text-sm",
                      isActive 
                        ? "bg-gradient-to-r from-[#1aa0a1] via-teal-600 to-teal-700 text-white font-bold shadow-lg shadow-[#1aa0a1]/30 border border-teal-400/30 scale-[1.02]" 
                        : "hover:bg-[#1aa0a1]/10 hover:text-teal-400 glass-pill border-transparent"
                    )}
                  >
                    <Link href={item.href} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("h-5 w-5 transition-transform", isActive ? "text-white scale-110" : "text-primary")} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-3 border-t border-white/10 space-y-1">
          <div className="px-3 pt-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">الإعدادات والأمان</div>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: 'لوحة الإدارة', side: 'left', align: 'center' }}
                  className="h-11 justify-start rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-sm font-medium"
                >
                  <Link href="/admin" className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>لوحة الإدارة والضبط</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip={{ children: 'تسجيل الخروج', side: 'left', align: 'center' }}
                  className="h-11 justify-start rounded-xl text-destructive hover:bg-destructive/15 transition-all text-sm font-medium"
                >
                    <LogOut className="h-4 w-4" />
                    <span>تسجيل الخروج</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col w-full">
         <header className="flex items-center justify-between px-6 p-4 bg-background/50 backdrop-blur-2xl border-b border-white/20 dark:border-white/10 h-20 shadow-sm sticky top-0 z-30">
          <div className='flex items-center gap-4'>
            <ModeToggle />
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl glass-pill hover:scale-105 transition-all">
                    <Bell className="h-5 w-5"/>
                    {allNotifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96 glass-panel p-2 shadow-2xl rounded-2xl border-white/20">
                  <DropdownMenuLabel className="font-bold text-base px-3 py-2">الإشعارات</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {allNotifications.length > 0 ? (
                    <div className="space-y-1 mt-1">
                      {expiredPosts.map(post => (
                        <DropdownMenuItem key={`post-${post.id}`} asChild className="rounded-xl p-3 cursor-pointer hover:bg-primary/10">
                          <Link href="/sponsored-posts" className="flex items-start gap-3">
                            <div className="bg-destructive/15 p-2 rounded-xl">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">انتهاء مدة المنشور</p>
                              <p className="text-xs text-muted-foreground">
                                انتهت مدة المنشور الخاص بصفحة "{post.pageName}".
                              </p>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      {debtLimitExceeded && (
                        <DropdownMenuItem asChild className="rounded-xl p-3 cursor-pointer hover:bg-destructive/10">
                          <Link href="/admin/invoices" className="flex items-start gap-3">
                            <div className="bg-red-500/15 p-2 rounded-xl">
                              <CreditCard className="h-4 w-4 text-red-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">تجاوز حد الديون</p>
                              <p className="text-xs text-muted-foreground">
                                إجمالي الديون المستحقة تجاوز 5000 ل.د.
                              </p>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </div>
                  ) : (
                    <p className="p-6 text-sm text-center text-muted-foreground">لا توجد إشعارات جديدة.</p>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="text-right glass-pill px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <span className="font-bold text-sm block leading-tight">{username || 'المستخدم'}</span>
                  <span className="text-[11px] text-muted-foreground block leading-none">متصل الآن</span>
                </div>
              </div>
            </div>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="glass-glow-button text-white rounded-xl h-10 w-10"><ChevronLeft className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="glass-pill rounded-xl h-10 w-10"><ChevronRight className="h-5 w-5" /></Button>
            </div>
             <Button variant="outline" asChild className="glass-pill rounded-xl font-bold hover:glass-pill-active transition-all">
                <Link href="/sales-history">
                    <BookText className="h-4 w-4 ml-2" />
                    سجل المبيعات اليومية
                </Link>
             </Button>
          </div>
          <div className="relative w-full max-w-sm hidden md:block">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في القائمة..."
              className="pr-10 h-11 glass-input rounded-xl text-sm"
            />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
            {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
