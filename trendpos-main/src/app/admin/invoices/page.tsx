'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllInvoices, updateInvoiceStatus, deleteInvoiceAndRestoreStock } from '@/lib/data';
import type { Invoice } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Eye, Trash2, CreditCard, Printer, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PaymentDialog } from '@/components/payment-dialog';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'مدفوعة':
      return 'secondary';
    case 'غير مدفوعة':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const fetchedInvoices = await getAllInvoices();
      setInvoices(fetchedInvoices);
    } catch (error) {
      toast({ variant: 'destructive', title: 'فشل في جلب البيانات' });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAllData();
    setIsClient(true);
  }, []);

  const handleOpenDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailsOpen(true);
  };
  
  const handleOpenPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentOpen(true);
  };

  const handleDeleteInvoice = async (invoiceToDelete: Invoice) => {
    try {
      await deleteInvoiceAndRestoreStock(invoiceToDelete);
      toast({ title: "تم حذف الفاتورة بنجاح" });
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "فشل في حذف الفاتورة" });
    }
  };
  
  const handlePaymentSuccess = async (details: { finalAmount: number, percentage: number }) => {
    if (!selectedInvoice) return;
    try {
        await updateInvoiceStatus(selectedInvoice.id, 'مدفوعة', details.finalAmount, details.percentage);
        toast({ title: 'تم تسديد الدين بنجاح', description: `تم تحديث حالة الفاتورة رقم ${selectedInvoice.id}.` });
        fetchAllData();
    } catch(error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'فشل في تحديث حالة الفاتورة' });
    } finally {
        setPaymentOpen(false);
        setSelectedInvoice(null);
    }
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
          <Receipt className="h-7 w-7 text-primary" />
          أرشيف الفواتير الشامل
        </h1>
      </div>

      <Card className="glass-panel p-2 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-lg font-bold font-headline">سجل كشوفات الفواتير</CardTitle>
          <CardDescription className="text-xs">
            عرض كافة الفواتير الصادرة للنظام مع إمكانيات الفحص والدفع السريع
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="glass-table">
            <TableHeader>
              <TableRow className="border-b border-white/15">
                <TableHead className="font-bold text-xs">رقم الفاتورة</TableHead>
                <TableHead className="font-bold text-xs">هاتف العميل</TableHead>
                <TableHead className="font-bold text-xs">التاريخ والوقت</TableHead>
                <TableHead className="font-bold text-xs">عدد الأصناف</TableHead>
                <TableHead className="font-bold text-xs">الإجمالي</TableHead>
                <TableHead className="font-bold text-xs">الحالة</TableHead>
                <TableHead className="text-left w-[50px] font-bold text-xs">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={7}><Skeleton className="h-8 w-full rounded-xl" /></TableCell>
                    </TableRow>
                ))
              ) : invoices.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground font-semibold">
                        لا توجد فواتير مبيعات سابقة.
                    </TableCell>
                </TableRow>
              ) : invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-primary/5 transition-colors border-b border-white/10">
                  <TableCell className="font-bold font-mono text-sm">{invoice.id.slice(0, 8)}</TableCell>
                  <TableCell dir="ltr" className="text-right font-mono text-xs">
                    {invoice.customerPhone || '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {isClient && invoice.date ? new Date(invoice.date).toLocaleString('ar-LY', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : <Skeleton className="h-4 w-32" />}
                  </TableCell>
                  <TableCell className="font-medium text-xs">{invoice.items.reduce((sum, item) => sum + item.quantity, 0)} عناصر</TableCell>
                  <TableCell className="font-bold text-sm text-primary">{invoice.total.toLocaleString('ar-LY', { style: 'currency', currency: 'LYD' })}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(invoice.status)} className="glass-pill text-xs px-2.5 py-0.5">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 p-0 glass-pill rounded-xl">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-panel p-1.5 rounded-2xl shadow-xl">
                        <DropdownMenuItem onClick={() => handleOpenDetails(invoice)} className="rounded-xl font-medium">
                          <Eye className="ml-2 h-4 w-4 text-primary" />
                          عرض تفاصيل الفاتورة
                        </DropdownMenuItem>
                        {invoice.status === 'غير مدفوعة' && (
                            <DropdownMenuItem onClick={() => handleOpenPayment(invoice)} className="rounded-xl font-medium text-emerald-600">
                                <CreditCard className="ml-2 h-4 w-4" />
                                تسديد الدين المستحق
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-white/15" />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="rounded-xl text-destructive font-medium focus:bg-destructive/10">
                                <Trash2 className="ml-2 h-4 w-4" />
                                حذف الفاتورة
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                           <AlertDialogContent className="glass-panel p-6 rounded-3xl border-white/30">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="font-bold text-lg">هل أنت متأكد من الحذف؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        سيتم حذف الفاتورة نهائياً من النظام.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="glass-pill rounded-xl">إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteInvoice(invoice)} className="bg-destructive hover:bg-destructive/90 rounded-xl">حذف نهائي</AlertDialogAction>
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
      
      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md glass-panel p-6 rounded-3xl border-white/30 shadow-2xl">
          {selectedInvoice && (
            <>
              <div ref={printRef} className="print-container-archived space-y-4">
                <div className="print-logo"></div>
                <DialogHeader className="text-center border-b border-white/15 pb-4 mb-4">
                  <DialogTitle className="text-2xl font-bold font-headline text-primary">إيصال مبيعات</DialogTitle>
                  <div className="text-xs text-muted-foreground space-y-1 mt-1">
                    <p><span className="font-semibold">رقم الفاتورة:</span> <span className="font-mono">{selectedInvoice.id}</span></p>
                    <p><span className="font-semibold">التاريخ:</span> {isClient && selectedInvoice.date ? new Date(selectedInvoice.date).toLocaleString('ar-LY', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</p>
                    {selectedInvoice.customerName && <p><span className="font-semibold">اسم العميل:</span> {selectedInvoice.customerName}</p>}
                    {selectedInvoice.customerPhone && <p><span className="font-semibold">هاتف العميل:</span> <span className="font-mono">{selectedInvoice.customerPhone}</span></p>}
                  </div>
                </DialogHeader>
                <div className="space-y-3">
                  {selectedInvoice.items.map((item) => (
                    <div key={item.variation.id} className="flex justify-between items-center text-xs glass-card p-2.5 rounded-xl border-white/20">
                      <div>
                        <p className="font-bold">{item.product.name} <span className="text-muted-foreground">({item.variation.name})</span></p>
                        <p className="text-[11px] text-muted-foreground">الكمية: {item.quantity} × {item.variation.sellingPrice.toLocaleString()} ل.د</p>
                      </div>
                      <p className="font-bold text-sm text-primary font-mono">{(item.variation.sellingPrice * item.quantity).toLocaleString()} ل.د</p>
                    </div>
                  ))}
                  <div className="space-y-1.5 text-xs pt-2 border-t border-white/15">
                    <div className="flex justify-between font-medium">
                      <p>المجموع الفرعي</p>
                      <p>{selectedInvoice.total.toLocaleString()} ل.د</p>
                    </div>
                    {selectedInvoice.paymentFeePercentage && selectedInvoice.paymentFeePercentage > 0 && (
                      <div className="flex justify-between font-medium">
                        <p>رسوم الخدمة ({selectedInvoice.paymentFeePercentage}%)</p>
                        <p>{((selectedInvoice.total * selectedInvoice.paymentFeePercentage) / 100).toLocaleString()} ل.د</p>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base border-t border-white/15 pt-2 mt-2">
                      <p>الإجمالي المستحق</p>
                      <p className="text-primary">{((selectedInvoice.finalAmount ?? selectedInvoice.total)).toLocaleString()} ل.د</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="noprint pt-4 border-t border-white/15">
                <Button type="button" variant="outline" onClick={() => setDetailsOpen(false)} className="glass-pill rounded-xl">إغلاق</Button>
                <Button type="button" onClick={handlePrint} className="glass-glow-button text-white rounded-xl font-bold"><Printer className="ml-2 h-4 w-4" /> طباعة الإيصال</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      {selectedInvoice && (
        <PaymentDialog 
            isOpen={isPaymentOpen}
            onClose={() => { setPaymentOpen(false); setSelectedInvoice(null); }}
            total={selectedInvoice.total}
            onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
