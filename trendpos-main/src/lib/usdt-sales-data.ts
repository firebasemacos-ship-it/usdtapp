'use client';

import { supabaseFetch, supabaseInsert, supabaseUpdate, supabaseDelete } from './supabase';
import type { UsdtSale, UsdtSaleStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

export const addUsdtSale = async (sale: Omit<UsdtSale, 'id' | 'date' | 'status'>): Promise<UsdtSale> => {
  const newId = `usdt_${Date.now()}_${uuidv4().substring(0, 5)}`;
  const record = {
    id: newId,
    customerName: sale.customerName,
    usdtAmount: sale.usdtAmount,
    costPerUsdtUSD: sale.costPerUsdtUSD,
    sellingPricePerUsdtLYD: sale.sellingPricePerUsdtLYD,
    totalCostLYD: sale.totalCostLYD,
    totalSaleLYD: sale.totalSaleLYD,
    profitLYD: sale.profitLYD,
    status: 'غير مدفوعة',
    date: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  await supabaseInsert('usdt_sales_v4', record);
  return {
    id: newId,
    ...sale,
    status: 'غير مدفوعة' as UsdtSaleStatus,
    date: new Date()
  };
};

export const getUsdtSales = async (): Promise<UsdtSale[]> => {
  const rows = await supabaseFetch('usdt_sales_v4', 'order=created_at.desc');
  if (!rows || !Array.isArray(rows)) return [];
  
  return rows.map((r: any) => ({
    id: r.id,
    customerName: r.customerName,
    usdtAmount: Number(r.usdtAmount || 0),
    costPerUsdtUSD: Number(r.costPerUsdtUSD || 0),
    sellingPricePerUsdtLYD: Number(r.sellingPricePerUsdtLYD || 0),
    totalCostLYD: Number(r.totalCostLYD || 0),
    totalSaleLYD: Number(r.totalSaleLYD || 0),
    profitLYD: Number(r.profitLYD || 0),
    status: (r.status || 'غير مدفوعة') as UsdtSaleStatus,
    date: r.date ? new Date(r.date) : new Date()
  }));
};

export const deleteUsdtSale = async (saleId: string): Promise<void> => {
  await supabaseDelete('usdt_sales_v4', saleId);
};

export const updateUsdtSaleStatus = async (saleId: string, status: UsdtSaleStatus): Promise<void> => {
  await supabaseUpdate('usdt_sales_v4', saleId, { status });
};
