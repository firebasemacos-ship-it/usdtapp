
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Product, ProductVariation } from '@/lib/types';
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
} from "@/components/ui/alert-dialog"

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { addProduct, getAllProducts, updateProduct, deleteProduct, getCategories, Category } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const emptyProduct: Omit<Product, 'id' | 'variations'> = {
    name: '',
    provider: '',
    category: '',
    logoUrl: '',
};

export default function AdminCardsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Partial<Product> | null>(null);
  const { toast } = useToast();
  
  const fetchAllData = useCallback(async () => {
      setLoading(true);
      try {
          const [fetchedProducts, fetchedCategories] = await Promise.all([
            getAllProducts(),
            getCategories()
          ]);
          setProducts(fetchedProducts);
          setCategories(fetchedCategories);
      } catch (error) {
          toast({ variant: 'destructive', title: 'فشل في جلب البيانات' });
      } finally {
          setLoading(false);
      }
  }, [toast]);
  
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleOpenDialog = (product?: Product) => {
      setProductToEdit(product ? JSON.parse(JSON.stringify(product)) : { ...emptyProduct, variations: [] });
      setDialogOpen(true);
  }

  const handleCloseDialog = () => {
      setProductToEdit(null);
      setDialogOpen(false);
  }

  const handleSaveProduct = async () => {
    if (!productToEdit || !productToEdit.name || !productToEdit.provider || !productToEdit.category) {
      toast({ variant: 'destructive', title: 'الرجاء ملء اسم المنتج والشركة والفئة' });
      return;
    }
    if (!productToEdit.variations || productToEdit.variations.length === 0) {
      toast({ variant: 'destructive', title: 'يجب إضافة تنوع واحد على الأقل للمنتج' });
      return;
    }

    try {
      const productToSave: Omit<Product, 'id'> = {
        name: productToEdit.name,
        provider: productToEdit.provider,
        category: productToEdit.category,
        logoUrl: productToEdit.logoUrl,
        variations: productToEdit.variations.map(v => {
            return {
                id: v.id || new Date().getTime().toString(),
                name: v.name,
                costPrice: Number(v.costPrice) || 0,
                profitPercentage: Number(v.profitPercentage) || 0,
            }
        })
      };

      if (productToEdit.id) {
        await updateProduct(productToEdit.id, productToSave);
        toast({ title: 'تم تحديث المنتج بنجاح' });
      } else {
        await addProduct(productToSave);
        toast({ title: 'تمت إضافة المنتج بنجاح' });
      }
  
      handleCloseDialog();
      fetchAllData();
    } catch (error) {
      console.error("Failed to save product: ", error);
      toast({ variant: 'destructive', title: 'فشل في حفظ المنتج' });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
      try {
          await deleteProduct(productId);
          toast({ title: 'تم حذف المنتج بنجاح' });
          fetchAllData();
      } catch (error) {
          toast({ variant: 'destructive', title: 'فشل في حذف المنتج' });
      }
  }

  const handleFieldChange = (field: keyof Omit<Product, 'id' | 'variations'>, value: string) => {
    if (productToEdit) {
      setProductToEdit({ ...productToEdit, [field]: value });
    }
  };

  const handleVariationChange = (index: number, field: keyof Omit<ProductVariation, 'id'>, value: string | number) => {
    if (productToEdit && productToEdit.variations) {
        const updatedVariations = [...productToEdit.variations];
        (updatedVariations[index] as any)[field] = value;
        setProductToEdit({ ...productToEdit, variations: updatedVariations });
    }
  };

  const addVariation = () => {
    if (productToEdit) {
        const newVariation: ProductVariation = {
            id: new Date().getTime().toString(),
            name: '',
            costPrice: 0,
            profitPercentage: 0,
        };
        setProductToEdit({ ...productToEdit, variations: [...(productToEdit.variations || []), newVariation] });
    }
  };

  const removeVariation = (index: number) => {
    if (productToEdit && productToEdit.variations) {
        const updatedVariations = productToEdit.variations.filter((_, i) => i !== index);
        setProductToEdit({ ...productToEdit, variations: updatedVariations });
    }
  };
    
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">إدارة المنتجات</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="ml-2" />
          إضافة منتج جديد
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المنتج</TableHead>
                <TableHead>الشركة</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>عدد التنوعات</TableHead>
                <TableHead className="w-[50px]">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        لا توجد منتجات لعرضها. الرجاء إضافة منتج جديد.
                    </TableCell>
                </TableRow>
              ) : products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.provider}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.variations?.length || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">افتح القائمة</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(product)}>تعديل</DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">حذف</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        سيتم حذف هذا المنتج وجميع تنوعاته بشكل دائم.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
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

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{productToEdit?.id ? 'تعديل منتج' : 'إضافة منتج جديد'}</DialogTitle>
            <DialogDescription>
              املأ تفاصيل المنتج الأساسية وأضف تنوعاته المختلفة.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم المنتج</Label>
                <Input id="name" value={productToEdit?.name ?? ''} onChange={(e) => handleFieldChange('name', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="provider">الشركة</Label>
                <Input id="provider" value={productToEdit?.provider ?? ''} onChange={(e) => handleFieldChange('provider', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <Input id="category" value={productToEdit?.category ?? ''} onChange={(e) => handleFieldChange('category', e.target.value)} list="category-suggestions" />
                    <datalist id="category-suggestions">
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name} />
                        ))}
                    </datalist>
                </div>
                <div>
                    <Label htmlFor="logoUrl">رابط الشعار (اختياري)</Label>
                    <Input id="logoUrl" value={productToEdit?.logoUrl ?? ''} onChange={(e) => handleFieldChange('logoUrl', e.target.value)} placeholder="https://example.com/logo.png" />
                </div>
            </div>
            <hr className="my-4" />
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">تنوعات المنتج</h3>
                <Button variant="outline" size="sm" onClick={addVariation}><PlusCircle className="h-4 w-4 ml-2" /> إضافة تنوع</Button>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto p-1">
                {productToEdit?.variations?.map((variation, index) => (
                  <div key={variation.id} className="p-4 border rounded-lg space-y-2 relative">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>اسم التنوع (شهري، 100UC..)</Label>
                        <Input value={variation.name} onChange={(e) => handleVariationChange(index, 'name', e.target.value)} />
                      </div>
                      <div>
                        <Label>سعر التكلفة (USD)</Label>
                        <Input type="number" value={variation.costPrice} onChange={(e) => handleVariationChange(index, 'costPrice', parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>نسبة الربح (%)</Label>
                         <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="number" value={variation.profitPercentage} onChange={(e) => handleVariationChange(index, 'profitPercentage', parseFloat(e.target.value) || 0)} className="pl-8" />
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="absolute top-2 left-2 text-destructive" onClick={() => removeVariation(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog}>إلغاء</Button>
            <Button type="submit" onClick={handleSaveProduct}>حفظ المنتج</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
