'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { OrderItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Clock } from 'lucide-react';

interface OrderPanelProps {
  orderItems: OrderItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onPlaceOrder: () => void;
  onPay: () => void;
  onAddSuggestion: (itemName: string) => void;
}

export function OrderPanel({
  orderItems,
  onUpdateQuantity,
  onPlaceOrder,
  onPay,
  onAddSuggestion,
}: OrderPanelProps) {
  const subtotal = orderItems.reduce(
    (acc, item) => acc + item.menuItem.price * item.quantity,
    62
  );
  const tax = 0.5;
  const total = subtotal + tax;

  const orderTypes = ['في المطعم', 'سفري', 'استلام من السيارة', 'توصيل'];
  const [activeOrderType, setActiveOrderType] = useState('في المطعم');

  return (
    <Card className="h-full flex flex-col rounded-none border-t-0 border-b-0 border-l-0">
      <CardHeader className="p-6">
        <CardTitle className="font-bold text-xl">
          تفاصيل الطلب
        </CardTitle>
        <div className="flex items-center gap-4 pt-4">
            <Avatar className="h-12 w-12">
                <AvatarImage src="https://picsum.photos/seed/customer/100/100" />
                <AvatarFallback>IE</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-bold text-base">جونسون ميتشل</p>
                <p className="text-muted-foreground text-xs">الثلاثاء، يوليو 2024 <Clock className="inline h-3 w-3 mx-1"/>00:00 مساءً</p>
                <p className="text-muted-foreground text-xs">+1(415)123-4567</p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-6 pt-0">
        
        <div className="flex gap-2 mb-6">
            {orderTypes.map(type => (
                <Button key={type} variant={activeOrderType === type ? "default" : "outline"} onClick={() => setActiveOrderType(type)} className={`rounded-full px-4 py-1 h-auto text-sm ${activeOrderType === type ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}>
                    {type}
                </Button>
            ))}
        </div>

        <div className="flex justify-between items-center mb-4 text-muted-foreground font-semibold text-sm">
            <span>طلب (#0476)</span>
            <span>طاولة (#1)</span>
            <span>أوستن كينج</span>
        </div>

        <ScrollArea className="flex-grow">
            {orderItems.length === 0 ? (
                <div className="space-y-4">
                    <div>
                        <Badge className="bg-primary/10 text-primary mb-2 font-semibold">مقبلات</Badge>
                        <div className="flex items-start justify-between">
                            <p className="font-semibold">تشكيلة جبن</p>
                            <p className="font-bold">$12.00</p>
                        </div>
                    </div>
                    <div>
                        <Badge className="bg-primary/10 text-primary my-2 font-semibold">الطبق الرئيسي</Badge>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-semibold">كرات اللحم</p>
                                <div className="flex gap-2 mt-1">
                                    <Badge variant="destructive" className="bg-red-100 text-red-700">بدون جمبري</Badge>
                                    <Badge variant="destructive" className="bg-red-100 text-red-700">دجاج إضافي</Badge>
                                    <Badge className="bg-red-100 text-red-700">نصف استواء</Badge>
                                </div>
                            </div>
                            <p className="font-bold">$12.00</p>
                        </div>
                    </div>
                    <div>
                        <Badge className="bg-primary/10 text-primary my-2 font-semibold">حلوى</Badge>
                        <div className="flex items-start justify-between">
                             <div>
                                <p className="font-semibold">سلمون بقشرة اللوز</p>
                                <div className="flex gap-2 mt-1">
                                    <Badge className="bg-red-100 text-red-700">سلطة</Badge>
                                    <Badge className="bg-red-100 text-red-700">صلصة البلسميك</Badge>
                                    <Badge className="bg-red-100 text-red-700">نصف استواء</Badge>
                                </div>
                            </div>
                            <p className="font-bold">$21.00</p>
                        </div>
                    </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={item.menuItem.id}>
                    {index === 0 && <Badge className="bg-primary/10 text-primary mb-2">مقبلات</Badge>}
                    {index === 1 && <Badge className="bg-primary/10 text-primary my-2">الطبق الرئيسي</Badge>}
                     <div className="flex items-start justify-between">
                        <p className="font-semibold">{item.menuItem.name}</p>
                        <p className="font-bold">${item.menuItem.price.toFixed(2)}</p>
                     </div>
                  </div>
                ))}
              </div>
            )}
        </ScrollArea>
      </CardContent>
      { (
        <CardFooter className="flex flex-col gap-4 p-6 bg-transparent">
          <div className="w-full space-y-2 text-sm">
            <div className="flex justify-between">
              <span>المجموع الفرعي</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>خصم</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between">
              <span>رسوم الخدمة</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between">
              <span>ضريبة</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2"/>
            <div className="flex justify-between font-bold text-lg">
              <span>الإجمالي</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button size="lg" variant="outline" onClick={onPlaceOrder} className="h-14 rounded-full text-lg border-primary text-primary hover:bg-primary/10">
              طباعة
            </Button>
            <Button size="lg" onClick={onPay} className="h-14 rounded-full text-lg bg-orange-500 text-white hover:bg-orange-600">
              إرسال
            </Button>
          </div>
          <Button size="lg" className="w-full h-14 rounded-full text-lg mt-2" onClick={onPay}>
              دفع ${total.toFixed(2)}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
