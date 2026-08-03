'use client';

import { useState, useEffect, useRef } from 'react';
import { CardSelection } from '@/components/card-selection';
import { InvoicePanel } from '@/components/invoice-panel';
import { PaymentDialog } from '@/components/payment-dialog';
import { getAllProducts, addInvoice, getSettings } from '@/lib/data';
import type { CardItem, Product, ProductVariation } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, RefreshCcw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function OrderPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceItems, setInvoiceItems] = useState<CardItem[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1);
  const { toast } = useToast();
  const invoicePanelRef = useRef<HTMLDivElement>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [products, settings] = await Promise.all([
        getAllProducts(),
        getSettings(),
      ]);
      setAllProducts(products);
      setExchangeRate(settings.exchangeRateUSD);
    } catch (error) {
      toast({ variant: "destructive", title: "فشل في جلب البيانات الأولية." });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const products = await getAllProducts();
      setAllProducts(products);
    } catch (error) {
      toast({ variant: "destructive", title: "فشل في تحديث المنتجات." });
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);
  
  const handlePrint = () => {
    window.print();
  };

  const handleAddItem = (product: Product, variation: ProductVariation) => {
    const costInLYD = variation.costPrice * exchangeRate;
    const sellingPrice = costInLYD * (1 + variation.profitPercentage / 100);
    const variationWithPrice = { ...variation, sellingPrice };

    setInvoiceItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.variation.id === variation.id && item.product.id === product.id
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.variation.id === variation.id && item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { product, variation: variationWithPrice, quantity: 1 }];
    });

    toast({
      title: "تمت إضافة البطاقة بنجاح",
      description: `${product.name} — ${variation.name}`,
    });
  };

  const handleUpdateQuantity = (variationId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setInvoiceItems((prev) => prev.filter((item) => item.variation.id !== variationId));
      return;
    } 

    setInvoiceItems((prev) =>
      prev.map((item) =>
        item.variation.id === variationId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const resetInvoice = () => {
    setInvoiceItems([]);
    setCustomerPhone('');
    setCustomerName('');
  };

  const handleConfirmSale = async (status: 'مدفوعة' | 'غير مدفوعة', details?: { finalAmount?: number; percentage?: number }) => {
    if(invoiceItems.length === 0) {
      toast({ variant: "destructive", title: "لا يمكن إنشاء فاتورة فارغة." });
      return;
    }
    
    const subtotal = invoiceItems.reduce((acc, item) => acc + (item.variation.sellingPrice ?? 0) * item.quantity, 0);
    const totalToSave = details?.finalAmount ?? subtotal;
    const invoiceId = uuidv4().substring(0, 8).toUpperCase();

    try {
        await addInvoice({
          id: invoiceId,
          items: invoiceItems.map(item => ({
              product: { id: item.product.id, name: item.product.name, provider: item.product.provider, category: item.product.category },
              variation: { 
                  id: item.variation.id, 
                  name: item.variation.name, 
                  costPrice: item.variation.costPrice, 
                  profitPercentage: item.variation.profitPercentage,
                  sellingPrice: item.variation.sellingPrice ?? 0,
                },
              quantity: item.quantity,
          })),
          total: subtotal,
          status: status,
          finalAmount: totalToSave,
          paymentFeePercentage: details?.percentage ?? 0,
          customerPhone: customerPhone.trim() || undefined,
          customerName: customerName.trim() || undefined,
        });

        if (status === 'غير مدفوعة') {
          toast({
            title: "تم حفظ الفاتورة كدين",
            description: `تم إنشاء الفاتورة ${invoiceId} بنجاح.`,
          });
        } else {
           toast({
            title: "تم تأكيد البيع بنجاح!",
            description: `تم إنشاء الفاتورة ${invoiceId} وإضافتها للسجل اليومي.`,
          });
        }
        
        resetInvoice();
        fetchProducts();

    } catch (error) {
        console.error(error);
        toast({ variant: "destructive", title: "فشل في حفظ الفاتورة." });
    }
  };
  
  const handlePaymentSuccess = (details: { finalAmount: number, percentage: number }) => {
    setPaymentDialogOpen(false);
    handleConfirmSale('مدفوعة', details);
  };

  const total = invoiceItems.reduce((acc, item) => acc + (item.variation.sellingPrice ?? 0) * item.quantity, 0);
  const totalItemCount = invoiceItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-5.5rem)]">
      {/* Clean Compact Top Control Bar (NO Exchange Rate) */}
      <div className="glass-panel px-5 py-2.5 rounded-2xl flex justify-between items-center gap-3 border border-white/20 dark:border-white/10 shadow-md noprint">
        <div className="flex items-center gap-2">
          <div className="glass-pill px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <span>السلة الحالية: {totalItemCount} عنصر</span>
          </div>
          <div className="glass-pill px-3.5 py-1.5 rounded-xl font-bold text-xs text-primary">
            {total.toLocaleString()} ل.د
          </div>
        </div>

        <div className="flex items-center gap-2">
          {invoiceItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetInvoice}
              className="glass-pill rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30 h-8 px-3"
            >
              <Trash2 className="h-3.5 w-3.5 ml-1" />
              تفريغ السلة
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchInitialData}
            title="تحديث البيانات"
            className="glass-pill rounded-xl h-8 w-8"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Order Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-hidden">
        {/* Products selection area (8 cols) */}
        <main className="lg:col-span-8 overflow-y-auto pr-1 noprint">
          {loading ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-48 rounded-xl" />
                  <Skeleton className="h-10 w-1/3 rounded-xl" />
              </div>
              <div className="flex gap-2">
                  <Skeleton className="h-10 w-24 rounded-xl" />
                  <Skeleton className="h-10 w-24 rounded-xl" />
                  <Skeleton className="h-10 w-24 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
              </div>
            </div>
          ) : (
            <CardSelection products={allProducts} onAddItem={handleAddItem} exchangeRate={exchangeRate} />
          )}
        </main>

        {/* Invoice Panel Sidebar (4 cols) */}
        <aside className="lg:col-span-4 h-full overflow-hidden">
          <InvoicePanel
            ref={invoicePanelRef}
            invoiceItems={invoiceItems}
            customerPhone={customerPhone}
            onCustomerPhoneChange={setCustomerPhone}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            onUpdateQuantity={handleUpdateQuantity}
            onConfirmSale={() => handleConfirmSale('غير مدفوعة')}
            onPay={() => setPaymentDialogOpen(true)}
            onPrint={handlePrint}
          />
        </aside>
      </div>

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        total={total}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
