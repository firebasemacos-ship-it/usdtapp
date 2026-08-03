'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, Search, ShoppingBag, DollarSign, CreditCard, 
  Package, Layers, BarChart, Settings, CheckCircle2, ShieldCheck, 
  Sparkles, Zap, ArrowLeftRight, FileText
} from 'lucide-react';
import Link from 'next/link';

interface SystemGuideSection {
  id: string;
  title: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  steps: string[];
}

const GUIDE_SECTIONS: SystemGuideSection[] = [
  {
    id: 'pos',
    title: 'نقطة البيع الحاسبة والكاشير (POS)',
    badge: 'الواجهة الرئيسية',
    icon: ShoppingBag,
    description: 'واجهة البيع الفوري السريعة لإصدار الفواتير وتحصيل المبيعات المباشرة.',
    steps: [
      'اختر تصنيف البطاقات أو ابحث عن البطاقة المطلوبة في شريط البحث.',
      'اضغط على الفئة المطلوبة لإضافتها تلقائياً إلى الفاتورة الحالية على اليسار.',
      'أدخل رقم هاتف العميل (واسم العميل إن وجد) لربط الفاتورة.',
      'اضغط على تأكيد البيع وإصدار الفاتورة أو طباعة الإيصال الفوري.'
    ]
  },
  {
    id: 'usdt',
    title: 'مبيعات USDT والعملات الرقمية',
    badge: 'إدارة التداول',
    icon: Zap,
    description: 'حاسبة وسجل مبيعات عملات USDT وتتبع الديون والعمليات الآجلة.',
    steps: [
      'أدخل كمية USDT المطلوبة وسعر التكلفة بالدولار ($).',
      'سيقوم النظام باحتساب التكلفة بالدينار تلقائياً بناءً على سعر الصرف المعيّن.',
      'حدد سعر البيع بالدينار لمشاهدة الربح الصافي الفوري قبل الحفظ.',
      'يمكنك تغيير حالة الدفع إلى (مدفوعة) بمجرد تحصيل قيمة الدينار من العميل.'
    ]
  },
  {
    id: 'cards',
    title: 'إدارة بطاقات التعبئة والمنتجات',
    badge: 'إدارة المخزون',
    icon: CreditCard,
    description: 'إضافة وتعديل البطاقات والخدمات والمنتجات الرقمية المتاحة للبيع.',
    steps: [
      'اضغط على (إضافة بطاقة جديدة) لتعريف منتج جديد في المتجر.',
      'حدد اسم البطاقة والتصنيف وسعر الشراء بالدولار وسعر البيع بالدينار.',
      'أدخل كمية المخزون المتاحة ليتم استهلاكها تلقائياً عند البيع.'
    ]
  },
  {
    id: 'packages',
    title: 'المنشورات والإعلانات الممولة',
    badge: 'التسويق والإعلانات',
    icon: Package,
    description: 'متابعة باقات الترويج والإعلانات الممولة عبر فيسبوك وتتبع التحصيل.',
    steps: [
      'إضافة منشور أو باقة إعلانية وتحديد الميزانية بالدولار والوصول المستهدف.',
      'متابعة حالة المنشور (قيد التعديل / نشط / منتهي).',
      'تسديد قيمة الباقة وتصفية الأرباح والديون المتعلقة بالمنشورات.'
    ]
  },
  {
    id: 'categories',
    title: 'إدارة التصنيفات والفئات',
    badge: 'التنظيم والترتيب',
    icon: Layers,
    description: 'تنظيم وتصنيف المنتجات في مجموعات سهلة الوصول أثناء البيع.',
    steps: [
      'إضافة فئة جديدة مثل (عملات رقمية، بطاقات دفع، إعلانات ممولة).',
      'تحديث أسماء الفئات أو حذف الفئات غير المستخدمة.'
    ]
  },
  {
    id: 'reports',
    title: 'التقارير المالية والأرباح',
    badge: 'الإحصائيات والأرباح',
    icon: BarChart,
    description: 'لوحة التحليلات المتقدمة لمتابعة الأرباح الصافية والديون القائمة.',
    steps: [
      'متابعة إجمالي الإيرادات ومجموع الأرباح الصافية المحققة.',
      'عرض رسم بياني تفاعلي لمبيعات البطاقات والإعلانات حسب الفترة الزمانية.'
    ]
  },
  {
    id: 'settings',
    title: 'إعدادات الصرف المتجر',
    badge: 'الضبط والتهيئة',
    icon: Settings,
    description: 'ضبط سعر صرف الدولار المعتمد تلقائياً في حساب التكاليف والأسعار.',
    steps: [
      'أدخل سعر صرف الدولار الافتراضي (دينار لكل 1$).',
      'اضغط على حفظ التغييرات ليتم تطبيق السعر تلقائياً على كل الحسابات.'
    ]
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuideSections = GUIDE_SECTIONS.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.steps.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8 font-headline dir-rtl" dir="rtl">
      
      {/* Top Banner Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1aa0a1]/20 text-[#1aa0a1] text-xs font-bold border border-[#1aa0a1]/30">
            <HelpCircle className="w-4 h-4" />
            مركز المساعدة والدليل التشغيلي
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            دليل استخدام منظومة USDT STORE
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            مرحباً بك في مركز المساعدة الرسمي! توضيح مفصل وشامل لكيفية العمل في كل قسم من أقسام المنظومة بخطوات مبسطة.
          </p>
        </div>

        <div className="w-full md:w-80 relative z-10">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-muted-foreground" />
          <Input 
            placeholder="ابحث عن قسم أو خطوة عمل..."
            className="pr-10 h-11 glass-input rounded-2xl text-xs font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Guide Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuideSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.id} className="glass-panel p-5 rounded-3xl border border-white/20 hover:border-[#1aa0a1]/40 transition-all shadow-xl flex flex-col justify-between group">
              <CardHeader className="p-0 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#1aa0a1]/15 border border-[#1aa0a1]/30 flex items-center justify-center text-[#1aa0a1] shadow-xs group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="glass-pill px-2.5 py-1 rounded-full text-[10px] font-bold text-[#1aa0a1]">
                    {section.badge}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground group-hover:text-[#1aa0a1] transition-colors">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {section.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-0 pt-2 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-[#1aa0a1] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  خطوات الاستخدام:
                </span>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {section.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#1aa0a1]/20 text-[#1aa0a1] text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Accordion */}
      <Card className="glass-panel p-6 rounded-3xl border border-white/20 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-foreground">الأسئلة الشائعة والأجوبة (FAQ)</h3>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          <AccordionItem value="item-1" className="glass-pill px-4 rounded-2xl border-white/10">
            <AccordionTrigger className="text-xs font-bold hover:no-underline text-foreground">
              كيف يتم حساب أرباح مبيعات USDT الصافية؟
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              يقوم النظام بضرب كمية USDT بسعر التكلفة بالدولار ($)، ثم تحويلها للدينار بحسب سعر الصرف المعتمد. بعد ذلك يتم استقطاع التكلفة الكلية بالدينار من سعر البيع الإجمالي لمعرفة صافي الربح الدقيق.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="glass-pill px-4 rounded-2xl border-white/10">
            <AccordionTrigger className="text-xs font-bold hover:no-underline text-foreground">
              كيف يمكن التبديل بين نظام الشحن ونظام المبيعات المباشرة؟
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              يمكنك التبديل مباشرة عبر زر (الانتقال إلى نظام المبيعات / نظام الشحن) في أعلى الشريط الجانبي في كلا المنظومتين بنقرة واحدة.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="glass-pill px-4 rounded-2xl border-white/10">
            <AccordionTrigger className="text-xs font-bold hover:no-underline text-foreground">
              أين يتم حفظ بيانات المبيعات والفواتير؟
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              جميع البيانات تُحفظ وتُزامن فورياً على قاعدة البيانات السحابية PostgreSQL (Supabase) لحفظ السجلات وتتبع المعاملات بأعلى درجات الأمان.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

    </div>
  );
}
