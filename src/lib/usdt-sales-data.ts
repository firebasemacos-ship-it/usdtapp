
'use client';

import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query, Timestamp, updateDoc } from 'firebase/firestore';
import type { UsdtSale, UsdtSaleStatus } from './types';
import { getSettings } from './data';

const usdtSalesCollection = collection(db, 'usdtSales');

const saleFromDoc = (doc: any): UsdtSale => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        date: (data.date as Timestamp)?.toDate(),
    } as UsdtSale;
}

export const addUsdtSale = async (sale: Omit<UsdtSale, 'id' | 'date' | 'status'>): Promise<UsdtSale> => {
    const saleWithTimestamp = {
        customerName: sale.customerName,
        usdtAmount: sale.usdtAmount,
        costPerUsdtUSD: sale.costPerUsdtUSD,
        sellingPricePerUsdtLYD: sale.sellingPricePerUsdtLYD,
        totalCostLYD: sale.totalCostLYD,
        totalSaleLYD: sale.totalSaleLYD,
        profitLYD: sale.profitLYD,
        status: 'غير مدفوعة' as UsdtSaleStatus,
        date: serverTimestamp()
    };
    const docRef = await addDoc(usdtSalesCollection, saleWithTimestamp);
    return { 
        id: docRef.id, 
        ...sale,
        status: 'غير مدفوعة' as UsdtSaleStatus,
        date: new Date() // Return client-side date for immediate UI update
    };
};

export const getUsdtSales = async (): Promise<UsdtSale[]> => {
    const q = query(usdtSalesCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(saleFromDoc);
};

export const deleteUsdtSale = async (saleId: string): Promise<void> => {
    const saleRef = doc(db, 'usdtSales', saleId);
    await deleteDoc(saleRef);
};

export const updateUsdtSaleStatus = async (saleId: string, status: UsdtSaleStatus): Promise<void> => {
    const saleRef = doc(db, 'usdtSales', saleId);
    await updateDoc(saleRef, { status });
};
