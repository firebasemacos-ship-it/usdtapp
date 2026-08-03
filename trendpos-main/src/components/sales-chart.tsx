
'use client';

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { getAllInvoices } from '@/lib/data';
import type { Invoice } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { format, getMonth, getYear } from 'date-fns';
import { ar } from 'date-fns/locale';

const chartConfig = {
  sales: {
    label: 'عدد المبيعات',
    color: 'hsl(var(--chart-1))',
  },
  revenue: {
    label: 'الإيرادات (ل.د)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function SalesChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      try {
        const invoices = await getAllInvoices();
        const paidInvoices = invoices.filter(inv => inv.status === 'مدفوعة');
        
        const currentYear = getYear(new Date());

        // Initialize months array for the current year
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
          month: format(new Date(currentYear, i), 'MMMM', { locale: ar }),
          monthIndex: i,
          sales: 0,
          revenue: 0,
        }));

        paidInvoices.forEach(invoice => {
          if (invoice.date) {
            const invoiceDate = new Date(invoice.date);
            if (getYear(invoiceDate) === currentYear) {
              const monthIndex = getMonth(invoiceDate);
              monthlyData[monthIndex].sales += 1;
              monthlyData[monthIndex].revenue += invoice.finalAmount ?? invoice.total;
            }
          }
        });

        setChartData(monthlyData);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
        // Set empty data on error
        setChartData(Array.from({ length: 12 }, (_, i) => ({
          month: format(new Date(new Date().getFullYear(), i), 'MMMM', { locale: ar }),
          monthIndex: i,
          sales: 0,
          revenue: 0,
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  if (loading) {
    return <Skeleton className="h-[250px] w-full" />;
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart 
        accessibilityLayer 
        data={chartData}
        margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
        }}
        >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          yAxisId="sales"
          orientation="left"
          stroke="hsl(var(--chart-1))"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
        />
        <YAxis
          yAxisId="revenue"
          orientation="right"
          stroke="hsl(var(--chart-2))"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent 
            formatter={(value, name) => {
              if (name === 'revenue') {
                return `${Number(value).toLocaleString()} ل.د`
              }
              return String(value);
            }}
          />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="sales" yAxisId="sales" fill="var(--color-sales)" radius={4} />
        <Bar dataKey="revenue" yAxisId="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
