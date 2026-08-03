
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
import { MoreHorizontal, PlusCircle, Trash2, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/lib/types';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUsers, addUser, updateUser, deleteUser } from '@/lib/users-data';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const emptyUser: Partial<User> = {
    username: '',
    password: '',
    role: 'cashier',
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<Partial<User> | null>(null);
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedUsers = await getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            toast({ variant: 'destructive', title: 'فشل في جلب المستخدمين' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenDialog = (user?: User) => {
        setUserToEdit(user ? { ...user, password: '' } : { ...emptyUser }); // Clear password for editing security
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setUserToEdit(null);
        setDialogOpen(false);
    };

    const handleSaveUser = async () => {
        if (!userToEdit || !userToEdit.username || !userToEdit.role) {
            toast({ variant: 'destructive', title: 'الرجاء ملء جميع الحقول المطلوبة' });
            return;
        }

        // Password is required for new users
        if (!userToEdit.id && !userToEdit.password) {
            toast({ variant: 'destructive', title: 'كلمة المرور مطلوبة للمستخدم الجديد' });
            return;
        }

        try {
            if (userToEdit.id) {
                // Update user
                const { id, ...dataToUpdate } = userToEdit;
                if (!dataToUpdate.password) { // Don't update password if it's empty
                    delete dataToUpdate.password;
                }
                await updateUser(id, dataToUpdate as Omit<User, 'id'>);
                toast({ title: 'تم تحديث المستخدم بنجاح' });
            } else {
                // Add user
                await addUser(userToEdit as Omit<User, 'id'>);
                toast({ title: 'تمت إضافة المستخدم بنجاح' });
            }

            handleCloseDialog();
            fetchUsers();
        } catch (error) {
            console.error("Failed to save user: ", error);
            toast({ variant: 'destructive', title: 'فشل في حفظ المستخدم' });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteUser(userId);
            toast({ title: 'تم حذف المستخدم بنجاح' });
            fetchUsers();
        } catch (error) {
            toast({ variant: 'destructive', title: 'فشل في حذف المستخدم' });
        }
    };

    const handleFieldChange = (field: keyof User, value: string) => {
        if (userToEdit) {
            setUserToEdit({ ...userToEdit, [field]: value });
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold font-headline">إدارة المستخدمين</h1>
                <Button onClick={() => handleOpenDialog()}>
                    <PlusCircle className="ml-2" />
                    إضافة مستخدم جديد
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>اسم المستخدم</TableHead>
                                <TableHead>الدور</TableHead>
                                <TableHead className="w-[50px]">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                    </TableRow>
                                ))
                            ) : users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                            <Shield className="h-3 w-3 ml-1" />
                                            {user.role === 'admin' ? 'مدير' : 'كاشير'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenDialog(user)}>تعديل</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">حذف</DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                سيتم حذف هذا المستخدم بشكل دائم.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{userToEdit?.id ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">اسم المستخدم</Label>
                            <Input id="username" value={userToEdit?.username ?? ''} onChange={(e) => handleFieldChange('username', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input id="password" type="password" placeholder={userToEdit?.id ? 'اتركه فارغًا لعدم التغيير' : 'مطلوب'} onChange={(e) => handleFieldChange('password', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">الدور</Label>
                            <Select value={userToEdit?.role} onValueChange={(value: 'admin' | 'cashier') => handleFieldChange('role', value)}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="اختر دورًا" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cashier">كاشير</SelectItem>
                                    <SelectItem value="admin">مدير</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCloseDialog}>إلغاء</Button>
                        <Button type="submit" onClick={handleSaveUser}>حفظ</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
