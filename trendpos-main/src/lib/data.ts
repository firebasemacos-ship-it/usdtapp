'use client';

import { supabaseFetch, supabaseInsert, supabaseUpdate, supabaseDelete } from './supabase';
import type { Invoice, Product, CardCategory, CardItem, ProductVariation, SystemSettings } from './types';
import { v4 as uuidv4 } from 'uuid';
import { startOfDay, endOfDay } from 'date-fns';

// --- Settings ---
export const getSettings = async (): Promise<SystemSettings> => {
  const rows = await supabaseFetch('settings_v4', 'id=eq.default_settings');
  if (rows && rows.length > 0) {
    return {
      exchangeRateUSD: Number(rows[0].exchangeRate || 7.0)
    };
  }
  return { exchangeRateUSD: 7.0 };
};

export const updateSettings = async (settings: Partial<SystemSettings>): Promise<void> => {
  if (settings.exchangeRateUSD !== undefined) {
    await supabaseUpdate('settings_v4', 'default_settings', {
      exchangeRate: settings.exchangeRateUSD
    });
  }
};

// --- Products & Cards ---
export async function getAllProducts(): Promise<Product[]> {
  const rows = await supabaseFetch('cards_v4', 'order=created_at.desc');
  if (!rows || !Array.isArray(rows)) return [];
  
  return rows.map((r: any) => {
    let parsedVariations: ProductVariation[] = [];
    if (r.variations) {
      try {
        parsedVariations = typeof r.variations === 'string' ? JSON.parse(r.variations) : r.variations;
      } catch (e) {
        parsedVariations = [];
      }
    }

    const costVal = Number(r.costusd ?? r.costUSD ?? 0);

    if (!parsedVariations || parsedVariations.length === 0) {
      parsedVariations = [
        {
          id: `var_${r.id}_1`,
          name: 'عادي / افتراضي',
          costPrice: costVal,
          profitPercentage: 10,
        }
      ];
    }

    return {
      id: r.id,
      name: r.name || 'منتج',
      provider: r.provider || 'عام',
      category: r.category || 'عام',
      logoUrl: r.logourl || r.logoUrl || '',
      variations: parsedVariations
    };
  });
}

export async function addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
  const newId = `prod_${Date.now()}_${uuidv4().substring(0, 5)}`;
  const firstVar = productData.variations?.[0];
  
  const record = {
    id: newId,
    name: productData.name,
    provider: productData.provider || 'عام',
    category: productData.category || 'عام',
    logourl: productData.logoUrl || '',
    costusd: Number(firstVar?.costPrice || 0),
    pricelyd: Number((firstVar?.costPrice || 0) * 7.0 * (1 + (firstVar?.profitPercentage || 10) / 100)),
    stockqty: 100,
    variations: JSON.stringify(productData.variations || []),
    created_at: new Date().toISOString()
  };

  await supabaseInsert('cards_v4', record);
  return { id: newId, ...productData };
}

export async function updateProduct(id: string, productData: Partial<Omit<Product, 'id'>>): Promise<void> {
  const firstVar = productData.variations?.[0];
  const updateData: any = {};
  if (productData.name) updateData.name = productData.name;
  if (productData.provider) updateData.provider = productData.provider;
  if (productData.category) updateData.category = productData.category;
  if (productData.logoUrl !== undefined) updateData.logourl = productData.logoUrl;
  if (productData.variations) {
    updateData.variations = JSON.stringify(productData.variations);
    if (firstVar) {
      updateData.costusd = Number(firstVar.costPrice || 0);
      updateData.pricelyd = Number((firstVar.costPrice || 0) * 7.0 * (1 + (firstVar.profitPercentage || 10) / 100));
    }
  }

  await supabaseUpdate('cards_v4', id, updateData);
}

export async function deleteProduct(id: string): Promise<void> {
  await supabaseDelete('cards_v4', id);
}

export const getCategories = async (): Promise<{ id: string, name: string }[]> => {
  const rows = await supabaseFetch('store_categories_v4', 'order=name.asc');
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return [
      { id: 'cat_1', name: 'عملات رقمية' },
      { id: 'cat_2', name: 'بطاقات دفع' },
      { id: 'cat_3', name: 'إعلانات ممولة' }
    ];
  }
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name
  }));
};

export const addCategory = async (name: CardCategory): Promise<{ id: string, name: CardCategory }> => {
  const newId = `cat_${Date.now()}_${uuidv4().substring(0, 5)}`;
  await supabaseInsert('store_categories_v4', { id: newId, name });
  return { id: newId, name };
};

export const updateCategory = async (id: string, oldName: CardCategory, newName: CardCategory): Promise<void> => {
  await supabaseUpdate('store_categories_v4', id, { name: newName });
};

export const deleteCategory = async (id: string): Promise<void> => {
  await supabaseDelete('store_categories_v4', id);
};

// --- Invoices ---
export const addInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
  const newId = `inv_${Date.now()}_${uuidv4().substring(0, 5)}`;
  const record = {
    id: newId,
    customer_name: invoiceData.customerName || 'عميل نقدي',
    customer_phone: invoiceData.customerPhone || '',
    total_amount: Number(invoiceData.total || 0),
    status: invoiceData.status || 'مدفوعة',
    items: JSON.stringify(invoiceData.items || []),
    created_at: new Date().toISOString()
  };

  await supabaseInsert('store_invoices_v4', record);
  return { id: newId, ...invoiceData };
};

export const getInvoicesForToday = async (): Promise<Invoice[]> => {
  const rows = await supabaseFetch('store_invoices_v4', 'order=created_at.desc');
  if (!rows || !Array.isArray(rows)) return [];
  
  return rows.map((r: any) => ({
    id: r.id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    total: Number(r.total_amount || 0),
    status: r.status as any,
    date: new Date(r.created_at),
    items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || [])
  }));
};

export const getDailyInvoices = async (date: Date): Promise<Invoice[]> => {
  return await getInvoicesForToday();
};

export const getAllInvoices = async (): Promise<Invoice[]> => {
  return await getInvoicesForToday();
};

export const updateInvoiceStatus = async (id: string, status: 'مدفوعة' | 'غير مدفوعة'): Promise<void> => {
  await supabaseUpdate('store_invoices_v4', id, { status });
};

export const deleteInvoiceAndRestoreStock = async (id: string): Promise<void> => {
  await supabaseDelete('store_invoices_v4', id);
};

export const getCardRevenue = async (): Promise<number> => {
  const invoices = await getInvoicesForToday();
  return invoices.reduce((sum, inv) => sum + (inv.status === 'مدفوعة' ? inv.total : 0), 0);
};

export const getCardDebt = async (): Promise<number> => {
  const invoices = await getInvoicesForToday();
  return invoices.reduce((sum, inv) => sum + (inv.status === 'غير مدفوعة' ? inv.total : 0), 0);
};

export const getTotalProfit = async (): Promise<number> => {
  const rev = await getCardRevenue();
  return rev * 0.15;
};

export const getTotalSalesCount = async (): Promise<number> => {
  const invoices = await getInvoicesForToday();
  return invoices.length;
};
