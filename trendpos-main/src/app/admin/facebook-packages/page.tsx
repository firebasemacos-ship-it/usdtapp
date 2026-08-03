
'use client';

import { useState, useCallback } from 'react';
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
import { MoreHorizontal, PlusCircle, Package, DollarSign, Target, CalendarDays, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { usePackageGroups, type PackageGroup, type PackageVariation } from '@/lib/packages-data';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const emptyGroup: Omit<PackageGroup, 'id' | 'variations'> = {
    name: '',
};

export default function AdminFacebookPackagesPage() {
  const { packageGroups, loading, refresh, addPackageGroup, updatePackageGroup, deletePackageGroup } = usePackageGroups();
  const { toast } = useToast();
  
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Partial<PackageGroup> | null>(null);


  const handleOpenDialog = (group?: PackageGroup) => {
      setGroupToEdit(group ? JSON.parse(JSON.stringify(group)) : { ...emptyGroup, variations: [] });
      setDialogOpen(true);
  }

  const handleCloseDialog = () => {
      setGroupToEdit(null);
      setDialogOpen(false);
  }

  const handleSaveGroup = async () => {
    if (!groupToEdit || !groupToEdit.name) {
      toast({ variant: 'destructive', title: 'الرجاء ملء اسم فئة الباقة' });
      return;
    }
    if (!groupToEdit.variations || groupToEdit.variations.length === 0) {
      toast({ variant: 'destructive', title: 'يجب إضافة تنوع واحد على الأقل للباقة' });
      return;
    }

    try {
      const groupToSave: Omit<PackageGroup, 'id'> = {
        name: groupToEdit.name,
        variations: groupToEdit.variations.map(v => ({
            id: v.id || new Date().getTime().toString(),
            name: v.name,
            reach: Number(v.reach) || 0,
            days: Number(v.days) || 0,
            budget: Number(v.budget) || 0,
            costUSD: Number(v.costUSD) || 0,
        }))
      };

      if (groupToEdit.id) {
        await updatePackageGroup(groupToEdit.id, groupToSave);
        toast({ title: 'تم تحديث فئة الباقة بنجاح' });
      } else {
        await addPackageGroup(groupToSave);
        toast({ title: 'تمت إضافة فئة الباقة بنجاح' });
      }
  
      handleCloseDialog();
      refresh();
    } catch (error) {
      console.error("Failed to save package group: ", error);
      toast({ variant: 'destructive', title: 'فشل في حفظ فئة الباقة' });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
      try {
          await deletePackageGroup(groupId);
          toast({ title: 'تم حذف فئة الباقة بنجاح' });
          refresh();
      } catch (error) {
          toast({ variant: 'destructive', title: 'فشل في حذف فئة الباقة' });
      }
  }

  const handleFieldChange = (field: keyof Omit<PackageGroup, 'id' | 'variations'>, value: string) => {
    if (groupToEdit) {
      setGroupToEdit({ ...groupToEdit, [field]: value });
    }
  };

  const handleVariationChange = (index: number, field: keyof Omit<PackageVariation, 'id'>, value: string | number) => {
    if (groupToEdit && groupToEdit.variations) {
        const updatedVariations = [...groupToEdit.variations];
        (updatedVariations[index] as any)[field] = value;
        setGroupToEdit({ ...groupToEdit, variations: updatedVariations });
    }
  };

  const addVariation = () => {
    if (groupToEdit) {
        const newVariation: PackageVariation = {
            id: new Date().getTime().toString(),
            name: '',
            reach: 0,
            days: 0,
            budget: 0,
            costUSD: 0,
        };
        setGroupToEdit({ ...groupToEdit, variations: [...(groupToEdit.variations || []), newVariation] });
    }
  };

  const removeVariation = (index: number) => {
    if (groupToEdit && groupToEdit.variations) {
        const updatedVariations = groupToEdit.variations.filter((_, i) => i !== index);
        setGroupToEdit({ ...groupToEdit, variations: updatedVariations });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">إدارة باقات فيسبوك</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="ml-2" />
          إضافة فئة باقات
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم فئة الباقة</TableHead>
                <TableHead>عدد التنوعات</TableHead>
                <TableHead className="w-[50px]">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))
              ) : packageGroups.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                        لا توجد فئات باقات. الرجاء إضافة فئة جديدة.
                    </TableCell>
                </TableRow>
              ) : packageGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{group.variations?.length || 0}</Badge>
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
                          <DropdownMenuItem onClick={() => handleOpenDialog(group)}>تعديل</DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">حذف</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        سيتم حذف فئة الباقة وجميع تنوعاتها بشكل دائم.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteGroup(group.id)} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
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
            <DialogTitle>{groupToEdit?.id ? 'تعديل فئة الباقات' : 'إضافة فئة باقات جديدة'}</DialogTitle>
            <DialogDescription>
              املأ تفاصيل فئة الباقة وأضف تنوعاتها المختلفة.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">اسم فئة الباقة</Label>
              <Input id="name" value={groupToEdit?.name ?? ''} onChange={(e) => handleFieldChange('name', e.target.value)} />
            </div>
            
            <hr className="my-4" />
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">تنوعات الباقة</h3>
                <Button variant="outline" size="sm" onClick={addVariation}><PlusCircle className="h-4 w-4 ml-2" /> إضافة تنوع</Button>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto p-1">
                {groupToEdit?.variations?.map((variation, index) => (
                  <div key={variation.id} className="p-4 border rounded-lg space-y-2 relative">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>اسم التنوع (برونزية، فضية...)</Label>
                             <div className="relative">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input value={variation.name} onChange={(e) => handleVariationChange(index, 'name', e.target.value)} className="pl-10"/>
                             </div>
                        </div>
                         <div>
                            <Label>الميزانية (سعر البيع) (ل.د)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="number" value={variation.budget} onChange={(e) => handleVariationChange(index, 'budget', parseFloat(e.target.value) || 0)} className="pl-10"/>
                            </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>الوصول المستهدف</Label>
                        <div className="relative">
                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="number" value={variation.reach} onChange={(e) => handleVariationChange(index, 'reach', parseInt(e.target.value, 10) || 0)} className="pl-10"/>
                        </div>
                      </div>
                      <div>
                        <Label>عدد الأيام</Label>
                        <div className="relative">
                             <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="number" value={variation.days} onChange={(e) => handleVariationChange(index, 'days', parseInt(e.target.value, 10) || 0)} className="pl-10"/>
                        </div>
                      </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>التكلفة (USD)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="number" value={variation.costUSD} onChange={(e) => handleVariationChange(index, 'costUSD', parseFloat(e.target.value) || 0)} className="pl-10"/>
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
            <Button type="submit" onClick={handleSaveGroup}>حفظ الفئة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
