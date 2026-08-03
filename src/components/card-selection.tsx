'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Gamepad2, Gift, Tv, Music, CreditCard, AppWindow, Star, CheckCircle, Search, Sparkles, LayoutGrid } from 'lucide-react';
import type { Product, ProductVariation } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Input } from './ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Icons } from './icons';

interface CardSelectionProps {
  products: Product[];
  onAddItem: (product: Product, variation: ProductVariation) => void;
  exchangeRate: number;
}

const categoryIcons: Record<string, { icon: React.ElementType, color: string }> = {
  'شحن الألعاب والتطبيقات': { icon: Gamepad2, color: 'text-violet-400' },
  'شحن ألعاب': { icon: Gamepad2, color: 'text-violet-400' },
  'البطاقات': { icon: Gift, color: 'text-rose-400' },
  'بطاقات هدايا': { icon: Gift, color: 'text-rose-400' },
  'تطبيقات': { icon: AppWindow, color: 'text-blue-400' },
  'الاشتراكات': { icon: Tv, color: 'text-amber-400' },
  'اشتراكات تلفزيون': { icon: Tv, color: 'text-amber-400' },
  'اشتراكات موسيقى': { icon: Music, color: 'text-emerald-400' },
  'بطاقات بنكية': { icon: CreditCard, color: 'text-sky-400' },
  'خدمات أخرى': { icon: Star, color: 'text-pink-400' },
  'الكل': { icon: LayoutGrid, color: 'text-primary' },
};

function ProductCardLogo({ url, name }: { url?: string, name: string }) {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return (
      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/30 via-rose-500/20 to-purple-600/30 border border-white/20 p-2 flex items-center justify-center text-primary shadow-md group-hover:scale-105 transition-transform">
        <Icons.logo className="h-9 w-9 object-contain" />
      </div>
    );
  }

  return (
    <div className="h-14 w-14 rounded-2xl bg-white/90 p-2 flex items-center justify-center shadow-md overflow-hidden border border-white/30 group-hover:scale-105 transition-transform">
      <Image
        src={url}
        alt={name}
        width={48}
        height={48}
        className="object-contain max-h-full max-w-full"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function CardSelection({ products, onAddItem, exchangeRate }: CardSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const allCategories = ['الكل', ...Array.from(new Set(products.map(p => p.category)))];
  const [activeCategory, setActiveCategory] = useState('الكل');

  const filteredProducts = products.filter(product => {
    const categoryMatch = activeCategory === 'الكل' || product.category === activeCategory;
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.provider.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="space-y-4">
      {/* Organized Category Navigation Bar */}
      <div className="glass-panel p-3 rounded-2xl border border-white/20 dark:border-white/10 shadow-md">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold font-headline text-muted-foreground flex items-center gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5 text-primary" />
            تصنيفات البطاقات والمنتجات
          </span>
          <span className="text-[11px] text-muted-foreground font-bold">
            {filteredProducts.length} بطاقات متاحة
          </span>
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-2 space-x-reverse py-0.5">
            {allCategories.map(category => {
              const CategoryIcon = categoryIcons[category]?.icon || Star;
              const isActive = activeCategory === category;
              const categoryCount = category === 'الكل' 
                ? products.length 
                : products.filter(p => p.category === category).length;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 border shrink-0",
                    isActive 
                      ? 'bg-gradient-to-r from-primary via-rose-500 to-accent text-white shadow-lg shadow-primary/25 border-white/30 scale-[1.02]' 
                      : 'glass-pill hover:bg-primary/10 text-foreground border-white/10 hover:border-primary/40'
                  )}
                >
                  <CategoryIcon className={cn("w-4 h-4", isActive ? "text-white" : (categoryIcons[category]?.color || 'text-muted-foreground'))} />
                  <span>{category}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono",
                    isActive ? "bg-white/25 text-white" : "bg-primary/10 text-primary"
                  )}>
                    {categoryCount}
                  </span>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="ابحث باسم البطاقة، المزود، أو الفئة..." 
          className="pr-10 h-11 glass-input rounded-2xl text-xs font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-bold glass-pill px-2 py-0.5 rounded-md"
          >
            مسح
          </button>
        )}
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredProducts.map((product) => {
            return (
              <Popover key={product.id}>
                <PopoverTrigger asChild>
                  <Card 
                    className="glass-card-interactive rounded-2xl p-3 border border-white/20 dark:border-white/10 cursor-pointer overflow-hidden flex flex-col justify-between hover:border-primary/50 group"
                  >
                    <CardContent className="p-1 flex flex-col items-center text-center space-y-2">
                      <ProductCardLogo url={product.logoUrl} name={product.name} />
                      
                      <div className="space-y-0.5 w-full px-1">
                        <h3 className="text-sm font-bold font-headline truncate text-foreground group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-medium truncate">
                          {product.provider}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="secondary" className="glass-pill text-[10px] px-2.5 py-0.5 font-bold text-primary border-primary/20">
                          {product.variations.length} {product.variations.length > 1 ? 'فئات متنوعة' : 'فئة واحدة'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </PopoverTrigger>
                <PopoverContent className="w-72 glass-panel p-3.5 rounded-2xl shadow-2xl border-white/30 dark:border-white/10" align="center">
                  <div className="grid gap-2.5">
                    <div className="space-y-0.5 border-b border-white/10 pb-2">
                      <h4 className="font-bold text-sm text-primary">{product.name}</h4>
                      <p className="text-[11px] text-muted-foreground">اختر الفئة والقيمة لإضافتها للفاتورة:</p>
                    </div>
                    <ScrollArea className="max-h-60">
                      <div className="grid gap-1.5 pr-1">
                        {product.variations.map(variation => {
                          const costInLYD = variation.costPrice * exchangeRate;
                          const sellingPrice = costInLYD * (1 + variation.profitPercentage / 100);
                          return (
                            <Button
                              key={variation.id}
                              variant="outline"
                              className="glass-pill justify-between h-11 rounded-xl hover:glass-pill-active transition-all text-xs"
                              onClick={() => onAddItem(product, variation)}
                            >
                              <span className="font-semibold">{variation.name}</span>
                              <span className="font-bold text-primary group-hover:text-white font-mono">{sellingPrice.toLocaleString()} ل.د</span>
                            </Button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 glass-panel rounded-2xl border border-white/20">
          <p className="text-base font-bold text-muted-foreground">لم يتم العثور على أي بطاقة</p>
          <p className="text-xs text-muted-foreground mt-1">
            {searchTerm ? `لا توجد نتائج طابقت "${searchTerm}".` : "لا توجد بطاقات متاحة في هذا التصنيف."}
          </p>
        </div>
      )}
    </div>
  );
}
