'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CardSelection } from '@/components/card-selection';
import { InvoicePanel } from '@/components/invoice-panel';
import { PaymentDialog } from '@/components/payment-dialog';
import { 
  getAllProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  addInvoice, 
  getAllInvoices, 
  updateInvoiceStatus, 
  deleteInvoiceAndRestoreStock, 
  getSettings, 
  getTotalProfit,
  Category 
} from '@/lib/data';
import type { CardItem, Product, ProductVariation, Invoice, CardCategory } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ShoppingCart, 
  CreditCard, 
  Tags, 
  Receipt, 
  BarChart3, 
  PlusCircle, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Printer, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Percent,
  RefreshCcw
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const emptyProduct: Omit<Product, 'id' | 'variations'> = {
  name: '',
  provider: '',
  category: '',
  logoUrl: '',
};

export default function InstantSalesPage() {
  const [activeTab, setActiveTab] = useState('pos');

  // --- POS Cashier State ---
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceItems, setInvoiceItems] = useState<CardItem[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(7.0);
  const { toast } = useToast();
  const invoicePanelRef = useRef<HTMLDivElement>(null);

  // --- Cards State ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [isProductDialogOpen, setProductDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Partial<Product> | null>(null);

  // --- Categories State ---
  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDialogMode, setCategoryDialogMode] = useState<'add' | 'edit'>('add');
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  // --- Invoices State ---
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDetailsOpen, setInvoiceDetailsOpen] = useState(false);
  const [isInvoicePaymentOpen, setInvoicePaymentOpen] = useState(false);

  // --- Reports State ---
  const [totalProfit, setTotalProfit] = useState(0);

  // --- Fetch All Initial Data ---
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, invoicesData, settingsData, profitData] = await Promise.all([
        getAllProducts(),
        getCategories(),
        getAllInvoices(),
        getSettings(),
        getTotalProfit()
      ]);
      setAllProducts(productsData);
      setCategories(categoriesData);
      setInvoices(invoicesData);
      setExchangeRate(settingsData.exchangeRateUSD || 7.0);
      setTotalProfit(profitData);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "فشل في جلب بيانات المبيعات المباشرة" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- POS Actions ---
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
    if (invoiceItems.length === 0) {
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

      toast({
        title: status === 'غير مدفوعة' ? "تم حفظ الفاتورة كدين" : "تم تأكيد البيع بنجاح!",
        description: `تم إنشاء الفاتورة ${invoiceId} بنجاح.`,
      });
      
      resetInvoice();
      fetchAllData();

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "فشل في حفظ الفاتورة" });
    }
  };

  // --- Cards & Product Actions ---
  const handleOpenProductDialog = (product?: Product) => {
    setProductToEdit(product ? JSON.parse(JSON.stringify(product)) : { ...emptyProduct, variations: [] });
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productToEdit || !productToEdit.name || !productToEdit.provider || !productToEdit.category) {
      toast({ variant: 'destructive', title: 'الرجاء ملء اسم المنتج والشركة والفئة' });
      return;
    }
    if (!productToEdit.variations || productToEdit.variations.length === 0) {
      toast({ variant: 'destructive', title: 'يجب إضافة نوع/فئة واحدة على الأقل للمنتج' });
      return;
    }

    try {
      if (productToEdit.id) {
        await updateProduct(productToEdit.id, productToEdit as Partial<Product>);
        toast({ title: 'تم تحديث المنتج بنجاح' });
      } else {
        await addProduct(productToEdit as Omit<Product, 'id'>);
        toast({ title: 'تم إضافة المنتج بنجاح' });
      }
      setProductDialogOpen(false);
      setProductToEdit(null);
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء حفظ المنتج' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      toast({ title: 'تم حذف المنتج بنجاح' });
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'فشل في حذف المنتج' });
    }
  };

  const handleAddVariation = () => {
    if (!productToEdit) return;
    const newVar: ProductVariation = {
      id: `var_${Date.now()}_${uuidv4().substring(0, 4)}`,
      name: '',
      costPrice: 0,
      profitPercentage: 10,
    };
    setProductToEdit({
      ...productToEdit,
      variations: [...(productToEdit.variations || []), newVar]
    });
  };

  const handleUpdateVariation = (index: number, field: keyof ProductVariation, value: any) => {
    if (!productToEdit || !productToEdit.variations) return;
    const updated = [...productToEdit.variations];
    updated[index] = { ...updated[index], [field]: value };
    setProductToEdit({ ...productToEdit, variations: updated });
  };

  const handleRemoveVariation = (index: number) => {
    if (!productToEdit || !productToEdit.variations) return;
    const updated = productToEdit.variations.filter((_, i) => i !== index);
    setProductToEdit({ ...productToEdit, variations: updated });
  };

  // --- Category Actions ---
  const handleOpenCategoryDialog = (mode: 'add' | 'edit', category?: Category) => {
    setCategoryDialogMode(mode);
    if (mode === 'edit' && category) {
      setCategoryToEdit(category);
      setCategoryNameInput(category.name);
    } else {
      setCategoryToEdit(null);
      setCategoryNameInput('');
    }
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryNameInput.trim()) {
      toast({ variant: 'destructive', title: 'الرجاء إدخال اسم الفئة' });
      return;
    }

    try {
      if (categoryDialogMode === 'edit' && categoryToEdit) {
        await updateCategory(categoryToEdit.id, categoryToEdit.name, categoryNameInput as CardCategory);
        toast({ title: 'تم تعديل اسم الفئة بنجاح' });
      } else {
        await addCategory(categoryNameInput as CardCategory);
        toast({ title: 'تم إضافة الفئة بنجاح' });
      }
      setCategoryDialogOpen(false);
      setCategoryNameInput('');
      setCategoryToEdit(null);
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء حفظ الفئة' });
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    try {
      await deleteCategory(cat.id);
      toast({ title: 'تم حذف الفئة بنجاح' });
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'فشل في حذف الفئة' });
    }
  };

  // --- Invoice Actions ---
  const handleDeleteInvoice = async (inv: Invoice) => {
    try {
      await deleteInvoiceAndRestoreStock(inv);
      toast({ title: "تم حذف الفاتورة بنجاح" });
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "فشل في حذف الفاتورة" });
    }
  };

  const handleInvoicePaymentSuccess = async (details: { finalAmount: number, percentage: number }) => {
    if (!selectedInvoice) return;
    try {
      await updateInvoiceStatus(selectedInvoice.id, 'مدفوعة', details.finalAmount, details.percentage);
      toast({ title: 'تم تسديد الدين بنجاح', description: `تم تحديث حالة الفاتورة ${selectedInvoice.id}.` });
      setInvoicePaymentOpen(false);
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'فشل في تحديث حالة الفاتورة' });
    }
  };

  // --- Reports Calculations ---
  const reportStats = useMemo(() => {
    const paidInvoices = invoices.filter(inv => inv.status === 'مدفوعة');
    const unpaidInvoices = invoices.filter(inv => inv.status === 'غير مدفوعة');
    const totalRevenue = paidInvoices.reduce((acc, inv) => acc + (inv.finalAmount ?? inv.total), 0);
    const totalDebt = unpaidInvoices.reduce((acc, inv) => acc + inv.total, 0);
    const salesCount = invoices.length;

    return {
      totalRevenue,
      totalDebt,
      salesCount,
      totalProfit
    };
  }, [invoices, totalProfit]);

  return (
    <div className="space-y-6 dir-rtl font-tajawal pb-12" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg text-white">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-teal-400" />
            نظام المبيعات المباشرة (TrendPOS)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            إدارة الكاشير، بطاقات الدفع وشحن الألعاب، الفواتير الفورية، والتقارير المالية بكفاءة متكاملة.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/30 px-3 py-1.5 text-xs font-bold">
            سعر الصرف: 1 USD = {exchangeRate} LYD
          </Badge>
          <Button variant="secondary" size="sm" onClick={fetchAllData} className="gap-2">
            <RefreshCcw className="w-4 h-4" /> تحديث البيانات
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="w-full flex flex-wrap h-auto p-1.5 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 gap-1">
          <TabsTrigger value="pos" className="flex-1 py-2.5 font-bold gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <ShoppingCart className="w-4 h-4" /> كاشير المبيعات
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex-1 py-2.5 font-bold gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <CreditCard className="w-4 h-4" /> إدارة البطاقات ({allProducts.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex-1 py-2.5 font-bold gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <Tags className="w-4 h-4" /> الفئات ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex-1 py-2.5 font-bold gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <Receipt className="w-4 h-4" /> الفواتير والسجل ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 py-2.5 font-bold gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4" /> التقارير والأرباح
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: POS CASHIER */}
        <TabsContent value="pos" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="lg:col-span-2 h-[550px] rounded-2xl" />
              <Skeleton className="h-[550px] rounded-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <CardSelection 
                  products={allProducts}
                  onAddItem={handleAddItem}
                  exchangeRate={exchangeRate}
                />
              </div>
              <div>
                <InvoicePanel
                  ref={invoicePanelRef}
                  invoiceItems={invoiceItems}
                  customerPhone={customerPhone}
                  onCustomerPhoneChange={setCustomerPhone}
                  customerName={customerName}
                  onCustomerNameChange={setCustomerName}
                  onUpdateQuantity={handleUpdateQuantity}
                  onConfirmSale={() => handleConfirmSale('مدفوعة')}
                  onPay={() => setPaymentDialogOpen(true)}
                  onPrint={() => window.print()}
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: CARDS & PRODUCTS MANAGEMENT */}
        <TabsContent value="cards" className="space-y-6">
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-bold">إدارة البطاقات والمنتجات المتاحة</CardTitle>
                <CardDescription>إضافة وتعديل البطاقات وأسعار التكلفة ونسب الربح حسب الفئات.</CardDescription>
              </div>
              <Button onClick={() => handleOpenProductDialog()} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                <PlusCircle className="w-4 h-4" /> إضافة بطاقة/منتج جديد
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم المنتج</TableHead>
                        <TableHead>الشركة / الموفر</TableHead>
                        <TableHead>الفئة</TableHead>
                        <TableHead>أنواع/فئات المنتج</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            لا توجد منتجات مضافة حالياً.
                          </TableCell>
                        </TableRow>
                      ) : (
                        allProducts.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-bold">{p.name}</TableCell>
                            <TableCell>{p.provider}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                                {p.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {p.variations?.map((v) => (
                                  <Badge key={v.id} variant="secondary" className="text-xs">
                                    {v.name}: ${v.costPrice} (+{v.profitPercentage}%)
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-left">
                              <div className="flex items-center justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleOpenProductDialog(p)}>
                                  تعديل
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      حذف
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        هل أنت تأكد من رغبتك في حذف المنتج "{p.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="gap-2">
                                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteProduct(p.id)} className="bg-destructive text-white">
                                        حذف المنتج
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CATEGORIES */}
        <TabsContent value="categories" className="space-y-6">
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-bold">فئات المنتجات والبطاقات</CardTitle>
                <CardDescription>تصنيف البطاقات لتسهيل عرضها وتصفحها في شاشة الكاشير.</CardDescription>
              </div>
              <Button onClick={() => handleOpenCategoryDialog('add')} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                <PlusCircle className="w-4 h-4" /> إضافة فئة جديدة
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48 rounded-xl" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>معرف الفئة</TableHead>
                        <TableHead>اسم الفئة</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">{c.id}</TableCell>
                          <TableCell className="font-bold">{c.name}</TableCell>
                          <TableCell className="text-left">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleOpenCategoryDialog('edit', c)}>
                                تعديل الاسم
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    حذف
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد حذف الفئة</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت مقتنع بحذف الفئة "{c.name}"؟
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-2">
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCategory(c)} className="bg-destructive text-white">
                                      حذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: INVOICES & HISTORY */}
        <TabsContent value="invoices" className="space-y-6">
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">سجل الفواتير والمبيعات اليومية</CardTitle>
              <CardDescription>عرض وتصفية جميع الفواتير الصادرة، التحقق من الديون وتأكيد التسديد.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الفاتورة</TableHead>
                        <TableHead>اسم الزبون</TableHead>
                        <TableHead>رقم الهاتف</TableHead>
                        <TableHead>إجمالي القيمة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            لا توجد فواتير صادرة حتى الآن.
                          </TableCell>
                        </TableRow>
                      ) : (
                        invoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-mono font-bold text-xs">{inv.id}</TableCell>
                            <TableCell>{inv.customerName || 'عميل نقدي'}</TableCell>
                            <TableCell dir="ltr" className="text-right font-mono text-xs">{inv.customerPhone || 'غير محدد'}</TableCell>
                            <TableCell className="font-bold text-teal-600 dark:text-teal-400">
                              {(inv.finalAmount ?? inv.total).toFixed(2)} د.ل
                            </TableCell>
                            <TableCell>
                              <Badge variant={inv.status === 'مدفوعة' ? 'secondary' : 'destructive'} className="font-bold">
                                {inv.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {inv.date ? new Date(inv.date).toLocaleDateString('ar-LY') : 'اليوم'}
                            </TableCell>
                            <TableCell className="text-left">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setSelectedInvoice(inv); setInvoiceDetailsOpen(true); }}>
                                    <Eye className="ml-2 h-4 w-4" /> عرض تفاصيل الفاتورة
                                  </DropdownMenuItem>
                                  {inv.status === 'غير مدفوعة' && (
                                    <DropdownMenuItem onClick={() => { setSelectedInvoice(inv); setInvoicePaymentOpen(true); }}>
                                      <DollarSign className="ml-2 h-4 w-4 text-green-600" /> تسديد الدين
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDeleteInvoice(inv)} className="text-destructive">
                                    <Trash2 className="ml-2 h-4 w-4" /> حذف الفاتورة
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: REPORTS & FINANCIALS */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-900 text-white rounded-2xl p-5 border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">إجمالي المبيعات المدفوعة</span>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400 mt-2">{reportStats.totalRevenue.toFixed(2)} د.ل</p>
            </Card>

            <Card className="bg-slate-900 text-white rounded-2xl p-5 border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">إجمالي الديون المستحقة</span>
                <Receipt className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-rose-400 mt-2">{reportStats.totalDebt.toFixed(2)} د.ل</p>
            </Card>

            <Card className="bg-slate-900 text-white rounded-2xl p-5 border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">صافي الأرباح التقديرية</span>
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400 mt-2">{reportStats.totalProfit.toFixed(2)} د.ل</p>
            </Card>

            <Card className="bg-slate-900 text-white rounded-2xl p-5 border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">عدد الفواتير الصادرة</span>
                <ShoppingCart className="w-5 h-5 text-teal-400" />
              </div>
              <p className="text-2xl font-black text-teal-400 mt-2">{reportStats.salesCount} فاتورة</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* PAYMENT DIALOG FOR POS */}
      {isPaymentDialogOpen && (
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          total={invoiceItems.reduce((acc, item) => acc + (item.variation.sellingPrice ?? 0) * item.quantity, 0)}
          onPaymentSuccess={(details) => {
            handleConfirmSale('مدفوعة', details);
            setPaymentDialogOpen(false);
          }}
        />
      )}

      {/* PRODUCT ADD/EDIT DIALOG */}
      {isProductDialogOpen && productToEdit && (
        <Dialog open={isProductDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogContent className="max-w-xl dir-rtl">
            <DialogHeader>
              <DialogTitle>{productToEdit.id ? 'تعديل بيانات المنتج/البطاقة' : 'إضافة منتج/بطاقة جديد'}</DialogTitle>
              <DialogDescription>أدخل اسم البطاقة والشركة الموفرة والفئة وأسعار التكلفة لكل نوع.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم المنتج / البطاقة</Label>
                  <Input 
                    value={productToEdit.name || ''} 
                    onChange={(e) => setProductToEdit({ ...productToEdit, name: e.target.value })}
                    placeholder="مثال: اشتراك ببجي UC"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الشركة الموفرة</Label>
                  <Input 
                    value={productToEdit.provider || ''} 
                    onChange={(e) => setProductToEdit({ ...productToEdit, provider: e.target.value })}
                    placeholder="مثال: PUBG Mobile"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الفئة</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={productToEdit.category || ''}
                    onChange={(e) => setProductToEdit({ ...productToEdit, category: e.target.value })}
                  >
                    <option value="">اختر الفئة...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>رابط اللوجو/الصورة (اختياري)</Label>
                  <Input 
                    value={productToEdit.logoUrl || ''} 
                    onChange={(e) => setProductToEdit({ ...productToEdit, logoUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Variations */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">أنواع وفئات المنتج (Variations)</Label>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddVariation} className="gap-1 text-xs">
                    <PlusCircle className="w-3.5 h-3.5" /> إضافة نوع
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {productToEdit.variations?.map((v, idx) => (
                    <div key={v.id || idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="col-span-5">
                        <Input 
                          placeholder="اسم النوع (مثال: 60 UC)" 
                          value={v.name} 
                          onChange={(e) => handleUpdateVariation(idx, 'name', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input 
                          type="number" 
                          placeholder="التكلفة $" 
                          value={v.costPrice} 
                          onChange={(e) => handleUpdateVariation(idx, 'costPrice', parseFloat(e.target.value) || 0)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input 
                          type="number" 
                          placeholder="الربح %" 
                          value={v.profitPercentage} 
                          onChange={(e) => handleUpdateVariation(idx, 'profitPercentage', parseFloat(e.target.value) || 0)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveVariation(idx)} className="h-7 w-7 text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setProductDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSaveProduct} className="bg-teal-600 hover:bg-teal-700 text-white">حفظ المنتج</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* CATEGORY DIALOG */}
      {isCategoryDialogOpen && (
        <Dialog open={isCategoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent className="max-w-md dir-rtl">
            <DialogHeader>
              <DialogTitle>{categoryDialogMode === 'add' ? 'إضافة فئة جديدة' : 'تعديل الفئة'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <Label>اسم الفئة</Label>
              <Input 
                value={categoryNameInput}
                onChange={(e) => setCategoryNameInput(e.target.value)}
                placeholder="مثال: بطاقات ترفيه"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSaveCategory} className="bg-teal-600 hover:bg-teal-700 text-white">حفظ الفئة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* INVOICE DETAILS DIALOG */}
      {isInvoiceDetailsOpen && selectedInvoice && (
        <Dialog open={isInvoiceDetailsOpen} onOpenChange={setInvoiceDetailsOpen}>
          <DialogContent className="max-w-md dir-rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>تفاصيل الفاتورة #{selectedInvoice.id}</span>
                <Badge variant={selectedInvoice.status === 'مدفوعة' ? 'secondary' : 'destructive'}>
                  {selectedInvoice.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-sm py-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">اسم الزبون:</span>
                <span className="font-bold">{selectedInvoice.customerName || 'عميل نقدي'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">رقم الهاتف:</span>
                <span className="font-mono">{selectedInvoice.customerPhone || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">المبلغ الإجمالي:</span>
                <span className="font-bold text-teal-600">{(selectedInvoice.finalAmount ?? selectedInvoice.total).toFixed(2)} د.ل</span>
              </div>

              <div className="pt-2">
                <p className="font-bold mb-2">العناصر المشتراة:</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedInvoice.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs bg-slate-50 dark:bg-slate-900 p-2 rounded">
                      <span>{item.product.name} — {item.variation.name} (x{item.quantity})</span>
                      <span className="font-bold">{((item.variation.sellingPrice ?? 0) * item.quantity).toFixed(2)} د.ل</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => window.print()} variant="outline" className="gap-2">
                <Printer className="w-4 h-4" /> طباعة
              </Button>
              <Button onClick={() => setInvoiceDetailsOpen(false)}>إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* INVOICE PAYMENT DIALOG */}
      {isInvoicePaymentOpen && selectedInvoice && (
        <PaymentDialog
          isOpen={isInvoicePaymentOpen}
          onClose={() => setInvoicePaymentOpen(false)}
          total={selectedInvoice.total}
          onPaymentSuccess={(details) => handleInvoicePaymentSuccess(details)}
        />
      )}
    </div>
  );
}
