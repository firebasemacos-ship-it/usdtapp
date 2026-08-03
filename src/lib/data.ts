

'use client';

import { db } from './firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, where, orderBy, Timestamp, doc, updateDoc, deleteDoc, writeBatch, setDoc, getDoc } from 'firebase/firestore';
import type { Invoice, Product, CardCategory, CardItem, ProductVariation, SystemSettings } from './types';
import { v4 as uuidv4 } from 'uuid';
import { startOfDay, endOfDay } from 'date-fns';


// --- Settings ---
const settingsRef = doc(db, 'settings', 'general');

export const getSettings = async (): Promise<SystemSettings> => {
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
        return docSnap.data() as SystemSettings;
    } else {
        // Default settings
        const defaultSettings = { exchangeRateUSD: 5.0 };
        await setDoc(settingsRef, defaultSettings);
        return defaultSettings;
    }
}

export const updateSettings = async (settings: Partial<SystemSettings>): Promise<void> => {
    await updateDoc(settingsRef, settings);
}


// --- Products (previously Cards) ---
const productsCollection = collection(db, 'products');

export async function getAllProducts(): Promise<Product[]> {
    const q = query(productsCollection, orderBy('name'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

const ensureCategoryExists = async (categoryName: string) => {
    if (!categoryName) return;
    const categoryQuery = query(collection(db, 'categories'), where('name', '==', categoryName));
    const querySnapshot = await getDocs(categoryQuery);
    if (querySnapshot.empty) {
        await addDoc(collection(db, 'categories'), { name: categoryName });
    }
};

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    await ensureCategoryExists(product.category);
    const productToSave = {
        ...product,
        variations: product.variations.map(({ sellingPrice, ...rest }: any) => rest)
    };
    const docRef = await addDoc(productsCollection, productToSave);
    return { id: docRef.id, ...product };
}

export async function updateProduct(productId: string, productData: Partial<Omit<Product, 'id'>>): Promise<void> {
    if(productData.category) {
        await ensureCategoryExists(productData.category);
    }
    const productToSave = {
      ...productData,
      ...(productData.variations && {
        variations: productData.variations.map(({ sellingPrice, ...rest }: any) => rest),
      }),
    };
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, productToSave);
}

export async function deleteProduct(productId: string): Promise<void> {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
}

// --- Categories ---
const categoriesCollection = collection(db, 'categories');

export type Category = {
    id: string;
    name: CardCategory;
}

export const getCategories = async (): Promise<Category[]> => {
    const q = query(categoriesCollection, orderBy('name'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

export const addCategory = async (name: CardCategory): Promise<Category> => {
    const docRef = await addDoc(categoriesCollection, { name });
    return { id: docRef.id, name };
};

export const updateCategory = async (id: string, oldName: CardCategory, newName: CardCategory): Promise<void> => {
    const batch = writeBatch(db);

    const categoryRef = doc(db, 'categories', id);
    batch.update(categoryRef, { name: newName });

    const productsToUpdateQuery = query(collection(db, 'products'), where('category', '==', oldName));
    const productsSnapshot = await getDocs(productsToUpdateQuery);
    productsSnapshot.forEach((productDoc) => {
        const productRef = doc(db, 'products', productDoc.id);
        batch.update(productRef, { category: newName });
    });

    await batch.commit();
};


export const deleteCategory = async (id: string): Promise<void> => {
    const catRef = doc(db, 'categories', id);
    await deleteDoc(catRef);
}


// --- Invoices ---
const invoicesCollection = collection(db, 'invoices');

type StrippedCardItem = {
    product: { id: string, name: string, provider: string, category: string },
    variation: { id: string, name: string, costPrice: number, profitPercentage: number, sellingPrice: number },
    quantity: number,
}

type AddInvoicePayload = Omit<Invoice, 'date' | 'items'> & { items: StrippedCardItem[] };

export const addInvoice = async (invoiceData: AddInvoicePayload) => {
    try {
        const docRef = await addDoc(invoicesCollection, {
            ...invoiceData,
            date: serverTimestamp(),
        });
        
        // We can't return the full invoice object with the server-generated date right away
        // without another read. The calling function should handle this.
        return { ...invoiceData, id: docRef.id, date: new Date() } as Invoice;
    } catch (error) {
        console.error("Error adding invoice: ", error);
        throw new Error("Failed to add invoice.");
    }
};

const invoiceFromDoc = (doc: any): Invoice => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        date: data.date ? data.date.toDate() : new Date(),
    } as Invoice;
};


export const getAllInvoices = async (): Promise<Invoice[]> => {
    const q = query(invoicesCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(invoiceFromDoc);
};

export const getDailyInvoices = async (): Promise<Invoice[]> => {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const q = query(
        invoicesCollection,
        where('date', '>=', Timestamp.fromDate(todayStart)),
        where('date', '<=', Timestamp.fromDate(todayEnd)),
        orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(invoiceFromDoc);
};

export const updateInvoiceStatus = async (invoiceFirestoreId: string, status: 'مدفوعة' | 'غير مدفوعة', finalAmount?: number, paymentFeePercentage?: number): Promise<void> => {
    const q = query(invoicesCollection, where("id", "==", invoiceFirestoreId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error(`Invoice with ID ${invoiceFirestoreId} not found.`);
    }
    
    const invoiceDoc = querySnapshot.docs[0];
    const invoiceRef = doc(db, 'invoices', invoiceDoc.id);

    await updateDoc(invoiceRef, { status, finalAmount, paymentFeePercentage });
};


export const deleteInvoiceAndRestoreStock = async (invoice: Invoice, allProducts?: Product[]): Promise<void> => {
    const q = query(invoicesCollection, where("id", "==", invoice.id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error(`Invoice with ID ${invoice.id} not found for deletion.`);
    }
    const invoiceDoc = querySnapshot.docs[0];
    const invoiceRef = doc(db, 'invoices', invoiceDoc.id);
    await deleteDoc(invoiceRef);
};


export const getTotalProfit = async (): Promise<number> => {
     const settings = await getSettings();
     const exchangeRate = settings.exchangeRateUSD;

     const q = query(invoicesCollection, where('status', '==', 'مدفوعة'));
     const snapshot = await getDocs(q);
     const paidInvoices = snapshot.docs.map(invoiceFromDoc);

    return paidInvoices.reduce((totalProfit, invoice) => {
        const revenue = invoice.finalAmount ?? invoice.total;
        
        const costLYD = invoice.items.reduce((cost, item: any) => {
             // Cost at time of sale in LYD
            const costAtSaleTime = item.variation.costPrice * exchangeRate;
            return cost + costAtSaleTime * item.quantity;
        }, 0);
        
        return totalProfit + (revenue - costLYD);
    }, 0);
};


export const getTotalSalesCount = async (): Promise<number> => {
    const q = query(invoicesCollection, where('status', '==', 'مدفوعة'));
    const snapshot = await getDocs(q);
    const paidInvoices = snapshot.docs.map(invoiceFromDoc);

    return paidInvoices.reduce((totalCount, invoice) => {
        const invoiceCount = invoice.items.reduce((count, item) => count + item.quantity, 0);
        return totalCount + invoiceCount;
    }, 0);
};

export const getCardRevenue = async (): Promise<number> => {
    const q = query(invoicesCollection, where('status', '==', 'مدفوعة'));
    const snapshot = await getDocs(q);
    const paidInvoices = snapshot.docs.map(invoiceFromDoc);
    return paidInvoices.reduce((acc, inv) => acc + (inv.finalAmount ?? inv.total), 0);
};

export const getCardDebt = async (): Promise<number> => {
    const q = query(invoicesCollection, where('status', '==', 'غير مدفوعة'));
    const snapshot = await getDocs(q);
    const unpaidInvoices = snapshot.docs.map(invoiceFromDoc);
    return unpaidInvoices.reduce((acc, inv) => acc + inv.total, 0);
};
