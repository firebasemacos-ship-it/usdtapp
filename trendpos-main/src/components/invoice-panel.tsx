'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { CardItem } from '@/lib/types';
import { Plus, Minus, Trash2, Printer, Phone, User, ShoppingBag, CreditCard, BookmarkCheck, Store, MapPin, Calendar, Clock, Hash } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface InvoicePanelProps {
  invoiceItems: CardItem[];
  customerPhone?: string;
  onCustomerPhoneChange?: (phone: string) => void;
  customerName?: string;
  onCustomerNameChange?: (name: string) => void;
  onUpdateQuantity: (variationId: string, newQuantity: number) => void;
  onConfirmSale: () => void;
  onPay: () => void;
  onPrint: () => void;
}

export const InvoicePanel = React.forwardRef<HTMLDivElement, InvoicePanelProps>(
  ({ invoiceItems, customerPhone = '', onCustomerPhoneChange, customerName = '', onCustomerNameChange, onUpdateQuantity, onConfirmSale, onPay, onPrint }, ref) => {
    const subtotal = invoiceItems.reduce(
      (acc, item) => acc + (item.variation.sellingPrice ?? 0) * item.quantity,
      0
    );
    const total = subtotal;

    const formattedDate = new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const formattedTime = new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' });
    const invoiceId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    return (
      <div ref={ref} className="h-full">
        
        {/* ========================================== */}
        {/* 🖨️ PROFESSIONAL PRINT-ONLY RECEIPT TEMPLATE */}
        {/* ========================================== */}
        <div className="hidden print:block print-only-receipt text-black p-4 space-y-4 text-xs dir-rtl" dir="rtl">
          
          {/* Header Branding */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-black">
            <div className="flex justify-center mb-1">
              <img src="/logo.png" alt="USDT STORE" className="h-12 w-auto object-contain" />
            </div>
            <h2 className="text-base font-bold tracking-tight">USDT STORE</h2>
            <p className="text-[10px] text-gray-700 font-semibold">نظام المبيعات المباشرة والخدمات الرقمية</p>
            <p className="text-[9px] text-gray-600 flex items-center justify-center gap-1 mt-0.5">
              <span>📍 الحدائق – شارع النفق – بعد حلواني الركن الغربي</span>
            </p>
          </div>

          {/* Invoice Meta */}
          <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span>رقم الفاتورة:</span>
              <span className="font-bold font-mono">{invoiceId}</span>
            </div>
            <div className="flex justify-between">
              <span>التاريخ والوقت:</span>
              <span className="font-medium">{formattedDate} • {formattedTime}</span>
            </div>
            {customerName && (
              <div className="flex justify-between">
                <span>اسم العميل:</span>
                <span className="font-bold">{customerName}</span>
              </div>
            )}
            {customerPhone && (
              <div className="flex justify-between">
                <span>رقم الهاتف:</span>
                <span className="font-bold font-mono">{customerPhone}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-right border-collapse my-2">
            <thead>
              <tr className="border-b border-black text-[10px] font-bold">
                <th className="py-1">الصنف والخدمة</th>
                <th className="py-1 text-center">الكمية</th>
                <th className="py-1 text-left">السعر</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-300 text-[10px]">
                  <td className="py-1.5 font-medium">
                    <div>{item.product.name}</div>
                    <div className="text-[9px] text-gray-600">{item.variation.name}</div>
                  </td>
                  <td className="py-1.5 text-center font-bold">x{item.quantity}</td>
                  <td className="py-1.5 text-left font-bold font-mono">
                    {((item.variation.sellingPrice ?? 0) * item.quantity).toLocaleString()} د.ل
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="pt-2 border-t border-black space-y-1 text-xs">
            <div className="flex justify-between font-bold text-sm border-b border-black pb-1">
              <span>الإجمالي الكلي:</span>
              <span className="font-mono">{total.toLocaleString()} د.ل</span>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-center pt-3 space-y-1 text-[9px] text-gray-700">
            <p className="font-bold">شكراً لتسوقكم معنا! نأمل رؤيتكم مجدداً.</p>
            <p className="text-[8px] text-gray-500">جميع الحقوق محفوظة © لشركة هوية للتسويق الرقمي • USD STORE</p>
          </div>
        </div>

        {/* ========================================== */}
        {/* 💻 SCREEN INTERACTIVE INVOICE PANEL UI     */}
        {/* ========================================== */}
        <Card className="h-full flex flex-col glass-panel rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden print:hidden">
          <CardHeader className="p-5 space-y-4 border-b border-white/15">
            <div className="flex items-center justify-between">
              <CardTitle className="font-bold text-xl font-headline flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#1aa0a1]" />
                الفاتورة الحالية
              </CardTitle>
              {invoiceItems.length > 0 && (
                <span className="glass-pill px-3 py-1 rounded-full text-xs font-bold text-[#1aa0a1]">
                  {invoiceItems.reduce((sum, item) => sum + item.quantity, 0)} عنصر
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="customerPhone" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-[#1aa0a1]" />
                  رقم هاتف العميل
                </Label>
                <div className="relative">
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="أدخل رقم الهاتف (مثال: 0912345678)"
                    value={customerPhone}
                    onChange={(e) => onCustomerPhoneChange?.(e.target.value)}
                    className="h-11 glass-input rounded-xl text-sm"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customerName" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-[#1aa0a1]" />
                  اسم العميل (اختياري)
                </Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="أدخل اسم العميل..."
                  value={customerName}
                  onChange={(e) => onCustomerNameChange?.(e.target.value)}
                  className="h-11 glass-input rounded-xl text-sm"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-grow flex flex-col p-4 pt-4 overflow-hidden">
            <ScrollArea className="flex-grow pr-1">
              {invoiceItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div className="h-16 w-16 rounded-full bg-[#1aa0a1]/10 flex items-center justify-center mb-3 text-[#1aa0a1]">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <p className="text-muted-foreground font-semibold text-sm">الفاتورة فارغة حالياً</p>
                  <p className="text-xs text-muted-foreground mt-1">اضغط على أي بطاقة لإضافتها للفاتورة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoiceItems.map((item) => (
                    <div key={item.variation.id} className="glass-card p-3 rounded-2xl border-white/20 flex items-center justify-between transition-all hover:scale-[1.01]">
                      <div className="space-y-0.5">
                        <p className="font-bold text-sm leading-tight">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.variation.name} — <span className="font-bold text-[#1aa0a1]">{(item.variation.sellingPrice ?? 0).toLocaleString()} ل.د</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg glass-pill p-0" onClick={() => onUpdateQuantity(item.variation.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-bold text-sm w-7 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg glass-pill p-0" onClick={() => onUpdateQuantity(item.variation.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg p-0" onClick={() => onUpdateQuantity(item.variation.id, 0)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>

          {invoiceItems.length > 0 && (
            <CardFooter className="flex flex-col gap-4 p-5 border-t border-white/15 bg-background/30 backdrop-blur-md">
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>المجموع الفرعي</span>
                  <span>{subtotal.toLocaleString()} ل.د</span>
                </div>
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>الخصم</span>
                  <span>0 ل.د</span>
                </div>
                <Separator className="my-2 bg-white/15"/>
                <div className="flex justify-between font-bold text-xl text-foreground">
                  <span>الإجمالي المستحق</span>
                  <span className="text-[#1aa0a1]">{total.toLocaleString()} ل.د</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button size="lg" variant="outline" onClick={onConfirmSale} className="h-12 rounded-xl text-base font-bold glass-pill border-[#1aa0a1]/40 text-[#1aa0a1] hover:glass-pill-active">
                  <BookmarkCheck className="ml-1.5 h-4 w-4" /> حفظ كدين
                </Button>
                <Button size="lg" onClick={onPay} className="h-12 rounded-xl text-base font-bold glass-glow-button text-white">
                  <CreditCard className="ml-1.5 h-4 w-4" /> سداد الآن
                </Button>
              </div>
              <Button size="lg" variant="secondary" onClick={onPrint} className="w-full h-12 rounded-xl text-base font-bold glass-pill hover:bg-[#1aa0a1]/20">
                <Printer className="ml-2 h-4 w-4 text-[#1aa0a1]" />
                طباعة الفاتورة
              </Button>
            </CardFooter>
          )}
        </Card>

      </div>
    );
  }
);

InvoicePanel.displayName = "InvoicePanel";
