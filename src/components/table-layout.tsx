'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Table as TableType } from '@/lib/types';
import { Armchair, ChefHat, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';

interface TableLayoutProps {
  tables: TableType[];
}

const statusConfig = {
  available: {
    label: 'متاحة',
    icon: Armchair,
    className: 'bg-primary/10 border-primary/50 text-primary-foreground',
    badgeVariant: 'secondary' as const,
    textColor: 'text-primary'
  },
  occupied: {
    label: 'مشغولة',
    icon: ChefHat,
    className: 'bg-amber-500/10 border-amber-500/50 text-amber-700',
    badgeVariant: 'default' as const,
    textColor: 'text-amber-600'
  },
  'needs-cleaning': {
    label: 'تحتاج تنظيف',
    icon: Sparkles,
    className: 'bg-destructive/10 border-destructive/50 text-destructive',
    badgeVariant: 'destructive' as const,
    textColor: 'text-destructive'
  },
};

export function TableLayout({ tables }: TableLayoutProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {tables.map((table) => {
        const config = statusConfig[table.status];
        const Icon = config.icon;

        return (
          <Card
            key={table.id}
            className={cn('hover:shadow-lg transition-shadow cursor-pointer', config.className)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={cn("text-4xl font-bold font-headline", config.textColor)}>
                {table.id}
              </CardTitle>
              <Icon className={cn("h-8 w-8", config.textColor)} />
            </CardHeader>
            <CardContent>
              <Badge variant={config.badgeVariant} className="w-full justify-center">{config.label}</Badge>
              <p className="text-xs text-center mt-2 text-muted-foreground">{table.capacity} مقاعد</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
