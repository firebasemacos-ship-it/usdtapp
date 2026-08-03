

export type Category = 'مقبلات' | 'أطباق رئيسية' | 'أطباق جانبية' | 'حلويات' | 'مشروبات';

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: Category;
  imageId: string;
};

export type OrderItem = {
  menuItem: MenuItem;
  quantity: number;
  specialRequests?: string;
};

export type Order = {
  id:string;
  items: OrderItem[];
  tableNumber: number;
  status: 'new' | 'in-progress' | 'ready' | 'completed';
  timestamp: Date;
  total: number;
};

export type TableStatus = 'available' | 'occupied' | 'needs-cleaning';

export type Table = {
  id: number;
  status: TableStatus;
  capacity: number;
};

export type CardCategory = string;

// Renamed Card to ProductVariation and created a new Product type
export type ProductVariation = {
    id: string; // Unique ID for the variation (e.g., generated client-side)
    name: string; // e.g., "اشتراك شهري", "100 UC"
    costPrice: number; // Stored in USD
    profitPercentage: number; // Stored as a percentage value (e.g., 10 for 10%)
};

export type Product = {
    id: string; // Firestore document ID
    name: string; // e.g., "اشتراك Netflix"
    provider: string;
    category: CardCategory;
    variations: ProductVariation[];
    logoUrl?: string;
};


export type CardItem = {
  product: Product;
  variation: ProductVariation & { sellingPrice: number };
  quantity: number;
};

export type Invoice = {
  id: string;
  items: CardItem[];
  total: number;
  date: Date; // Should be stored as Timestamp in Firestore
  status: 'مدفوعة' | 'غير مدفوعة';
  finalAmount?: number;
  paymentFeePercentage?: number;
  customerPhone?: string;
  customerName?: string;
}

export type SystemSettings = {
    exchangeRateUSD: number;
}

export type User = {
    id: string;
    username: string;
    password?: string; // Optional because we don't want to send it to the client
    role: 'admin' | 'cashier';
};

export type UsdtSaleStatus = 'مدفوعة' | 'غير مدفوعة';

export type UsdtSale = {
  id: string; // Firestore document ID
  customerName: string;
  usdtAmount: number;
  costPerUsdtUSD: number; // Cost per 1 USDT in USD
  sellingPricePerUsdtLYD: number; // Selling price per 1 USDT in LYD
  totalCostLYD: number; // usdtAmount * costPerUsdtUSD * exchangeRate
  totalSaleLYD: number; // usdtAmount * sellingPricePerUsdtLYD
  profitLYD: number; // totalSaleLYD - totalCostLYD
  date: any; // Firestore Timestamp
  status: UsdtSaleStatus;
};
