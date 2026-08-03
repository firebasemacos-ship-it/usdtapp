'use client';

import type { Invoice, Product, CardCategory, CardItem, ProductVariation, SystemSettings } from './types';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = "https://fztwhoslvlluzuqahast.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dHdob3NsdmxsdXp1cWFoYXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY4OTg4MywiZXhwIjoyMTAxMjY1ODgzfQ.AH-Z1ernKnoGtXCfTv2pDv5mh4tgWW9qOnRWgiui-K8";

export async function supabaseFetch(table: string, queryParams: string = '') {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${queryParams}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      cache: 'no-store'
    });
    if (!res.ok) {
      console.error(`Supabase fetch error on ${table}:`, await res.text());
      return [];
    }
    return await res.json();
  } catch (e) {
    console.error(`Supabase network error on ${table}:`, e);
    return [];
  }
}

export async function supabaseInsert(table: string, data: any) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      console.error(`Supabase insert error on ${table}:`, await res.text());
      return null;
    }
    const result = await res.json();
    return result[0] || result;
  } catch (e) {
    console.error(`Supabase insert network error on ${table}:`, e);
    return null;
  }
}

export async function supabaseUpdate(table: string, id: string, data: any) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      console.error(`Supabase update error on ${table}:`, await res.text());
      return null;
    }
    const result = await res.json();
    return result[0] || result;
  } catch (e) {
    console.error(`Supabase update network error on ${table}:`, e);
    return null;
  }
}

export async function supabaseDelete(table: string, id: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      console.error(`Supabase delete error on ${table}:`, await res.text());
    }
    return true;
  } catch (e) {
    console.error(`Supabase delete network error on ${table}:`, e);
    return false;
  }
}

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

export type Category = {
  id: string;
  name: CardCategory;
};

export const getCategories = async (): Promise<Category[]> => {
  const rows = await supabaseFetch('store_categories_v4', 'order=name.asc');
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return [
      { id: 'cat_1', name: 'شحن ألعاب وتطبيق' },
      { id: 'cat_2', name: 'بطاقات دفع' },
      { id: 'cat_3', name: 'عملات رقمية' }
    ];
  }
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name
  }));
};

export const addCategory = async (name: CardCategory): Promise<Category> => {
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
export const addInvoice = async (invoiceData: any) => {
  const newId = `inv_${Date.now()}_${uuidv4().substring(0, 5)}`;
  const record = {
    id: newId,
    customer_name: invoiceData.customerName || 'عميل نقدي',
    customer_phone: invoiceData.customerPhone || '',
    total_amount: Number(invoiceData.total || invoiceData.finalAmount || 0),
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

export const getDailyInvoices = async (): Promise<Invoice[]> => {
  return await getInvoicesForToday();
};

export const getAllInvoices = async (): Promise<Invoice[]> => {
  return await getInvoicesForToday();
};

export const updateInvoiceStatus = async (invoiceFirestoreId: string, status: 'مدفوعة' | 'غير مدفوعة', finalAmount?: number, paymentFeePercentage?: number): Promise<void> => {
  const updateData: any = { status };
  if (finalAmount !== undefined) updateData.total_amount = finalAmount;
  await supabaseUpdate('store_invoices_v4', invoiceFirestoreId, updateData);
};

export const deleteInvoiceAndRestoreStock = async (invoice: Invoice): Promise<void> => {
  await supabaseDelete('store_invoices_v4', invoice.id);
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
