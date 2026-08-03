'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { placeholderImageMap } from '@/lib/placeholder-images';
import type { Category, MenuItem } from '@/lib/types';
import { Plus } from 'lucide-react';

interface MenuGridProps {
  menuItems: MenuItem[];
  onAddItem: (item: MenuItem) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'بار': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.25 2.25H9.75V4.34C9.75 5.56 8.81 6.5 7.59 6.5H5.25V8H7.59C9.66 8 11.34 6.42 11.34 4.49V2.25H12.66V4.49C12.66 6.42 14.34 8 16.41 8H18.75V6.5H16.41C15.19 6.5 14.25 5.56 14.25 4.34V2.25ZM21 8.75V20.25C21 21.22 20.22 22 19.25 22H4.75C3.78 22 3 21.22 3 20.25V8.75C3 8.09 3.53 7.54 4.18 7.51L4.25 7.5H19.75C20.44 7.5 21 8.06 21 8.75ZM8.25 10.5V12H6.75V10.5H8.25ZM8.25 13.5V15H6.75V13.5H8.25ZM8.25 16.5V18H6.75V16.5H8.25ZM12.75 10.5H11.25V18H12.75V10.5Z" fill="currentColor"/></svg>,
  'طعام': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.155 12.2625C16.155 10.8375 17.295 9.6975 18.72 9.6975C20.145 9.6975 21.285 10.8375 21.285 12.2625C21.285 13.6875 20.145 14.8275 18.72 14.8275C17.295 14.8275 16.155 13.6875 16.155 12.2625ZM18.72 11.2425C18.15 11.2425 17.685 11.7075 17.685 12.2775C17.685 12.8475 18.15 13.3125 18.72 13.3125C19.29 13.3125 19.755 12.8475 19.755 12.2775C19.755 11.7075 19.29 11.2425 18.72 11.2425ZM11 2C15.96 2 20 6.04 20 11V20.29C20 21.23 19.23 22 18.29 22H5.71C4.77 22 4 21.23 4 20.29V11C4 6.04 8.04 2 11 2ZM11 3.5C8.865 3.5 6.93 4.6125 5.715 6.24L16.755 17.28C18.3825 16.065 19.5 14.13 19.5 12V11C19.5 6.315 15.6825 2.5 11 2.5L11 3.5ZM5.715 6.24C5.1 7.035 4.695 7.95 4.5 8.925V12C4.5 14.13 5.6175 16.065 7.245 17.28L18.285 6.24C17.07 4.6125 15.135 3.5 13 3.5H11C9.69 3.5 8.46 3.84 7.395 4.41L5.715 6.24Z" fill="currentColor"/></svg>,
  'مشروبات': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 4.25L18.59 6.84L17.18 8.25L16 7.07V4.25ZM8 4.25V7.07L6.82 8.25L5.41 6.84L8 4.25ZM15 9V14.5C15 16.81 13.91 18.91 12.28 20.22L12 20.44L11.72 20.22C10.09 18.91 9 16.81 9 14.5V9H15ZM16.5 9H20V10.5H16.5V9ZM7.5 9V10.5H4V9H7.5Z" fill="currentColor"/></svg>,
  'شوربة': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 3V4.5H5.25V6H6V7.5H7.5V3H6ZM9.75 3V7.5H11.25V3H9.75ZM13.5 3V7.5H15V3H13.5ZM21.25 10C21.242 10.6415 21.0968 11.2726 20.825 11.84C20.375 12.76 19.6 13.5 18.65 13.91C17.41 14.41 16.03 14.5 14.75 14.5H9.25C6.36 14.5 4 12.14 4 9.25C4 7.6 4.7 6.13 5.86 5.1L17.9 17.14C18.97 18.3 20.53 19 22.25 19V10H21.25ZM2.75 10C2.75 13.45 5.55 16.25 9 16.25H14.75C15.82 16.25 16.86 16.09 17.81 15.78L7.22 5.19C4.69 6.27 2.75 8.7 2.75 11.5V10Z" fill="currentColor"/></svg>,
  'بيتزا': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM7.5 10.5C8.33 10.5 9 9.83 9 9C9 8.17 8.33 7.5 7.5 7.5C6.67 7.5 6 8.17 6 9C6 9.83 6.67 10.5 7.5 10.5ZM7.5 15C8.33 15 9 14.33 9 13.5C9 12.67 8.33 12 7.5 12C6.67 12 6 12.67 6 13.5C6 14.33 6.67 15 7.5 15ZM12 12C11.17 12 10.5 11.33 10.5 10.5C10.5 9.67 11.17 9 12 9C12.83 9 13.5 9.67 13.5 10.5C13.5 11.33 12.83 12 12 12ZM16.5 13.5C17.33 13.5 18 12.83 18 12C18 11.17 17.33 10.5 16.5 10.5C15.67 10.5 15 11.17 15 12C15 12.83 15.67 13.5 16.5 13.5Z" fill="currentColor"/></svg>,
  'أسماك': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.5C22 14.09 20.39 16.32 18.11 17.35L17.5 11.5L18.11 5.65C20.39 6.68 22 8.91 22 11.5ZM16.5 18.75L16 11.5L16.5 4.25C14.73 3.44 12.59 3 10.5 3C5.53 3 1.5 6.92 1.5 11.5C1.5 16.08 5.53 20 10.5 20C12.59 20 14.73 19.56 16.5 18.75ZM4.5 11.5C4.5 10.22 4.9 9.02 5.59 8.04L11.5 11.5L5.59 14.96C4.9 13.98 4.5 12.78 4.5 11.5Z" fill="currentColor"/></svg>,
}

export function MenuGrid({ menuItems = [], onAddItem }: MenuGridProps) {
  
  const categories: string[] = ['بار', 'طعام', 'مشروبات', 'شوربة', 'بيتزا', 'أسماك'];

  const itemsToShow = menuItems.slice(0, 9);

  return (
    <div>
        <h2 className="text-xl font-semibold mb-4">الفئة</h2>
        <div className="flex gap-4 mb-8">
            {categories.map(category => (
                <Button key={category} variant="outline" className="flex flex-col h-24 w-24 gap-2 bg-card rounded-2xl justify-center items-center">
                     <div className="text-primary text-3xl">{categoryIcons[category] || '❔'}</div>
                    <span className="font-semibold text-base">{category}</span>
                </Button>
            ))}
        </div>

        <h2 className="text-xl font-semibold mb-4">قائمة خاصة لك</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {itemsToShow.map((item: MenuItem, index: number) => {
                const placeholder = placeholderImageMap.get(item.imageId);
                const isHighlighted = index === 1;
                return (
                  <Card key={item.id} className={`overflow-hidden rounded-2xl text-center shadow-lg transition-all duration-300 hover:scale-105 ${isHighlighted ? 'bg-primary/10 border-2 border-primary' : ''}`}>
                    <CardHeader className="p-0 items-center">
                      {placeholder && (
                        <Image
                          src={placeholder.imageUrl}
                          alt={item.name}
                          width={120}
                          height={120}
                          className="object-cover rounded-full mt-6"
                          data-ai-hint={placeholder.imageHint}
                        />
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pb-0">
                      <CardTitle className="text-base font-bold">{item.name}</CardTitle>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center justify-center p-4 pt-2">
                      <Button className="w-full rounded-full h-10 text-base font-bold bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => onAddItem(item)}>
                        <Plus className="ml-2" size={20} /> أضف
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
        </div>
    </div>
  );
}
