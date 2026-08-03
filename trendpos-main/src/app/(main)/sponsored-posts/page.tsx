'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DollarSign, Link as LinkIcon, Target, ThumbsUp, MessageCircle, Save, CreditCard, Bell, BellOff, CalendarDays, Package, Trash2, Phone, Megaphone, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSponsoredPosts, type SponsoredPost } from '@/lib/dashboard-data';
import { usePackageGroups, type PackageGroup, type PackageVariation } from '@/lib/packages-data';
import { Skeleton } from '@/components/ui/skeleton';
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

type PostStatus = 'قيد التعديل' | 'نشط' | 'منتهي';

export default function SponsoredPostsPage() {
  const { posts: sponsoredPosts, loading: postsLoading, refresh: refreshPosts, addSponsoredPost, updatePostStatus, updatePaidStatus, deleteSponsoredPost } = useSponsoredPosts();
  const { packageGroups, loading: packagesLoading } = usePackageGroups();

  const [pageName, setPageName] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [phone, setPhone] = useState('');
  
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const selectedGroup = packageGroups.find(g => g.id === selectedGroupId);
  const selectedVariation = selectedGroup?.variations.find(v => v.id === selectedVariationId);

  useEffect(() => {
    setSelectedVariationId(null);
  }, [selectedGroupId]);

  const handleTrackPost = async () => {
    if (!pageName || !postUrl || !selectedGroupId || !selectedVariationId || !selectedVariation || !selectedGroup) {
      toast({ variant: 'destructive', title: 'الرجاء ملء جميع الحقول واختيار فئة وتنوع الباقة' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addSponsoredPost({
        pageName: pageName,
        postUrl: postUrl,
        phone: phone.trim() || undefined,
        targetReach: selectedVariation.reach,
        days: selectedVariation.days,
        budget: selectedVariation.budget,
        costUSD: selectedVariation.costUSD,
        packageName: `${selectedGroup.name} - ${selectedVariation.name}`,
      });
      
      setPageName('');
      setPostUrl('');
      setPhone('');
      setSelectedGroupId(null);
      setSelectedVariationId(null);
      refreshPosts();

      toast({ title: 'تمت إضافة المنشور الممول بنجاح!' });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ أثناء إضافة المنشور',
        description: 'الرجاء التأكد من صحة البيانات والمحاولة مرة أخرى.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (postId: string, newStatus: PostStatus) => {
    await updatePostStatus(postId, newStatus);
    refreshPosts();
  };
  
  const handlePaidChange = async (postId: string, isPaid: boolean) => {
    await updatePaidStatus(postId, isPaid);
    refreshPosts();
    toast({ title: `تم تحديث حالة الدفع للمنشور` });
  };

  const handleSaveStatus = async (post: SponsoredPost) => {
    if (post.status === 'منتهي') {
      await deleteSponsoredPost(post.id);
      toast({ title: `تم أرشفة المنشور "${post.pageName}"` });
    } else {
      await updatePostStatus(post.id, post.status);
      toast({ title: `تم حفظ حالة المنشور "${post.pageName}"` });
    }
    refreshPosts();
  };
  
  const handleDelete = async (postId: string) => {
    try {
      await deleteSponsoredPost(postId);
      toast({ title: 'تم حذف المنشور بنجاح' });
      refreshPosts();
    } catch (error) {
      toast({ variant: 'destructive', title: 'فشل حذف المنشور' });
    }
  };

  const unpaidPosts = sponsoredPosts.filter(p => !p.paid);
  const paidPosts = sponsoredPosts.filter(p => p.paid);

  const PostCard = ({ post }: { post: SponsoredPost }) => (
    <Card key={post.id} className="glass-card-interactive rounded-3xl p-2 border border-white/30 dark:border-white/10 flex flex-col justify-between overflow-hidden">
      <CardHeader className="p-4 pb-2 space-y-2 border-b border-white/10">
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-lg font-bold text-primary">{post.pageName}</CardTitle>
          <Badge variant={post.status === 'نشط' ? 'default' : post.status === 'منتهي' ? 'destructive' : 'outline'} className="glass-pill text-xs px-2.5 py-0.5 font-bold">
            {post.status}
          </Badge>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground font-medium">{post.platform}</span>
          {post.packageName && (
            <Badge variant="secondary" className="glass-pill gap-1 text-[11px] text-muted-foreground">
              <Package className="h-3 w-3 text-primary"/>{post.packageName}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 flex-grow text-xs font-medium">
        <div className="flex items-center justify-between">
          <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary font-bold hover:underline">
            <LinkIcon className="h-3.5 w-3.5 ml-1.5" />
            معاينة رابط المنشور
          </a>
        </div>

        {post.phone && (
          <div className="flex items-center justify-between glass-pill p-2 rounded-xl">
            <span className="flex items-center text-muted-foreground">
              <Phone className="h-3.5 w-3.5 ml-1.5 text-primary" />
              هاتف العميل
            </span>
            <span className="font-bold font-mono text-primary" dir="ltr">{post.phone}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 ml-1.5 text-emerald-500" />
            الميزانية (سعر البيع)
          </span>
          <span className="font-bold text-sm text-foreground">{post.budget.toLocaleString()} ل.د</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-muted-foreground">
            <Target className="h-3.5 w-3.5 ml-1.5 text-blue-500" />
            الوصول المستهدف
          </span>
          <span className="font-bold">{post.targetReach.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 ml-1.5 text-amber-500" />
            الأيام
          </span>
          <span className="font-bold">{post.days} أيام</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="flex items-center text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5 ml-1.5 text-violet-500" />
            حالة السداد
          </span>
          <div className="flex items-center gap-2">
            <Switch
              id={`paid-switch-${post.id}`}
              checked={post.paid}
              onCheckedChange={(checked) => handlePaidChange(post.id, checked)}
              aria-label="حالة السداد"
            />
            <Label htmlFor={`paid-switch-${post.id}`} className="mb-0 cursor-pointer">
              <Badge variant={post.paid ? 'secondary' : 'destructive'} className={post.paid ? 'bg-emerald-500/20 text-emerald-600 font-bold' : ''}>
                {post.paid ? 'تم السداد' : 'غير مسدد'}
              </Badge>
            </Label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3 p-4 pt-0">
        <div className="w-full space-y-1.5">
          <Label className="text-[11px] font-semibold text-muted-foreground">تحديث حالة التمويل</Label>
          <div className="flex gap-2">
            <Select value={post.status} onValueChange={(value: PostStatus) => handleStatusChange(post.id, value)}>
              <SelectTrigger className="w-full glass-input h-10 rounded-xl text-xs">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent className="glass-panel">
                <SelectItem value="قيد التعديل">قيد التعديل</SelectItem>
                <SelectItem value="نشط">نشط</SelectItem>
                <SelectItem value="منتهي">منتهي</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => handleSaveStatus(post)} className="glass-pill h-10 w-10 rounded-xl" title="حفظ الحالة">
              <Save className="h-4 w-4 text-primary" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-10 w-10 rounded-xl" title="حذف المنشور">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-panel p-6 rounded-3xl border-white/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-bold text-lg">تأكيد الحذف النهائي</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف المنشور الممول الخاص بصفحة "{post.pageName}" نهائياً من النظام.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="glass-pill rounded-xl">إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl">حذف نهائي</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
          <Megaphone className="h-7 w-7 text-primary" />
          إدارة وتتبع المنشورات الممولة
        </h1>
      </div>

      <Card className="glass-panel p-2 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-lg font-bold font-headline flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            إضافة منشور ممول جديد
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="pageName" className="font-semibold text-xs">اسم الصفحة أو الحساب</Label>
              <Input
                id="pageName"
                placeholder="مثال: متجر ترند فيسبوك"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                disabled={isSubmitting}
                className="h-11 glass-input rounded-xl text-sm"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="phone" className="font-semibold text-xs">رقم هاتف العميل (اختياري)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="مثال: 0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
                className="h-11 glass-input rounded-xl text-sm"
                dir="ltr"
              />
            </div>
            <div className="md:col-span-4 space-y-1.5">
              <Label htmlFor="postUrl" className="font-semibold text-xs">رابط المنشور الممول</Label>
              <Input
                id="postUrl"
                placeholder="https://facebook.com/post/..."
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                disabled={isSubmitting}
                className="h-11 glass-input rounded-xl text-sm"
                dir="ltr"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="packageGroup" className="font-semibold text-xs">فئة الباقة الممولة</Label>
              {packagesLoading ? <Skeleton className="h-11 w-full rounded-xl" /> : (
                <Select value={selectedGroupId ?? ''} onValueChange={setSelectedGroupId} disabled={isSubmitting}>
                  <SelectTrigger id="packageGroup" className="h-11 glass-input rounded-xl text-sm">
                    <SelectValue placeholder="اختر فئة الباقة..." />
                  </SelectTrigger>
                  <SelectContent className="glass-panel">
                    {packageGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="packageVariation" className="font-semibold text-xs">تنوع وحجم الباقة</Label>
              <Select value={selectedVariationId ?? ''} onValueChange={setSelectedVariationId} disabled={isSubmitting || !selectedGroup}>
                <SelectTrigger id="packageVariation" className="h-11 glass-input rounded-xl text-sm">
                  <SelectValue placeholder="اختر التنوع والوصول..." />
                </SelectTrigger>
                <SelectContent className="glass-panel">
                  {selectedGroup?.variations.map(variation => (
                    <SelectItem key={variation.id} value={variation.id}>
                      {`${variation.name} (${variation.budget.toLocaleString()} ل.د)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedVariation && (
              <div className="md:col-span-4 glass-card p-4 rounded-2xl border-white/20 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div>
                  <span className="text-[11px] text-muted-foreground block">سعر البيع</span>
                  <span className="font-bold text-sm text-primary">{selectedVariation.budget.toLocaleString()} ل.د</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">التكلفة الإدارية</span>
                  <span className="font-bold text-sm text-amber-500">${selectedVariation.costUSD}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">الوصول المتوقع</span>
                  <span className="font-bold text-sm text-blue-500">{selectedVariation.reach.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">مد التشغيل</span>
                  <span className="font-bold text-sm">{selectedVariation.days} أيام</span>
                </div>
              </div>
            )}

            <div className="md:col-span-4 pt-2">
              <Button onClick={handleTrackPost} disabled={isSubmitting} className="w-full h-12 glass-glow-button text-white font-bold rounded-xl text-base">
                {isSubmitting ? 'جاري الحفظ...' : 'تأكيد وحفظ المنشور الممول'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="unpaid" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="glass-pill p-1.5 rounded-2xl h-12">
            <TabsTrigger value="unpaid" className="rounded-xl px-5 h-9 font-bold data-[state=active]:glass-pill-active">
              غير مسددة ({unpaidPosts.length})
            </TabsTrigger>
            <TabsTrigger value="paid" className="rounded-xl px-5 h-9 font-bold data-[state=active]:glass-pill-active">
              مسددة بالكامل ({paidPosts.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-xl px-5 h-9 font-bold data-[state=active]:glass-pill-active">
              الجميع ({sponsoredPosts.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="unpaid">
          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}
            </div>
          ) : unpaidPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {unpaidPosts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <p className="text-center py-12 glass-panel rounded-3xl text-muted-foreground font-semibold">لا توجد منشورات غير مسددة حالياً.</p>
          )}
        </TabsContent>

        <TabsContent value="paid">
          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}
            </div>
          ) : paidPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paidPosts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <p className="text-center py-12 glass-panel rounded-3xl text-muted-foreground font-semibold">لا توجد منشورات مسددة حالياً.</p>
          )}
        </TabsContent>

        <TabsContent value="all">
          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}
            </div>
          ) : sponsoredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sponsoredPosts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <p className="text-center py-12 glass-panel rounded-3xl text-muted-foreground font-semibold">لا توجد منشورات ممولة مسجلة في النظام.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
