export type OrderStatus = 
  | 'pending'
  | 'processed'
  | 'ready'
  | 'shipped'
  | 'arrived_dubai'
  | 'arrived_benghazi'
  | 'arrived_tripoli'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'paid';

export type UserType = 'regular' | 'temporary';

export type ShippingUser = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  userType?: UserType;
  totalDebt?: number;
  ordersCount?: number;
  created_at?: string;
};

export type Manager = {
  id: string;
  name: string;
  username: string;
  password?: string;
  phone?: string;
  permissions?: string[];
  created_at?: string;
};

export type Representative = {
  id: string;
  name: string;
  phone: string;
  activeOrdersCount?: number;
  completedOrdersCount?: number;
  created_at?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  invoiceNumber?: string;
  userId: string;
  userName: string;
  customerName?: string;
  userPhone: string;
  description: string;
  itemDescription?: string;
  operationDate: string;
  purchasePriceUSD: number;
  sellingPriceLYD: number;
  shippingCostLYD: number;
  paidAmountLYD: number;
  remainingAmount: number;
  status: OrderStatus;
  notes?: string;
  exchangeRate?: number;
  pricePerKiloLYD?: number;
  representativeId?: string;
  representativeName?: string;
  created_at?: string;
};

export type Transaction = {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  type: 'payment' | 'charge' | 'refund';
  date: string;
  notes?: string;
  created_at?: string;
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  created_at?: string;
};

export type Deposit = {
  id: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  date: string;
  notes?: string;
  created_at?: string;
};

export type Creditor = {
  id: string;
  name: string;
  type: 'person' | 'company';
  contactInfo?: string;
  currency: 'LYD' | 'USD';
  totalDebt: number;
  notes?: string;
  created_at?: string;
};

export type ExternalDebt = {
  id: string;
  creditorId: string;
  creditorName: string;
  amount: number;
  currency?: 'LYD' | 'USD';
  type?: 'borrow' | 'repay' | string;
  date: string;
  description?: string;
  notes?: string;
  status?: string;
  created_at?: string;
};

export type AppSettings = {
  exchangeRate: number;
  pricePerKiloLYD: number;
  pricePerKiloUSD: number;
};

export type ManualLabel = {
  id: string;
  recipientName: string;
  recipientPhone: string;
  city: string;
  address?: string;
  packageCount: number;
  weight?: number;
  shippingCost: number;
  notes?: string;
  date: string;
  created_at?: string;
};

// --- Sales System (TrendPOS / USDT STORE) Types ---

export type Category = 'مقبلات' | 'أطباق رئيسية' | 'أطباق جانبية' | 'حلويات' | 'مشروبات';

export type CardCategory = string;

export type ProductVariation = {
  id: string;
  name: string;
  costPrice: number;
  profitPercentage: number;
  sellingPrice?: number;
};

export type Product = {
  id: string;
  name: string;
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
  date: Date;
  status: 'مدفوعة' | 'غير مدفوعة';
  finalAmount?: number;
  paymentFeePercentage?: number;
  customerPhone?: string;
  customerName?: string;
};

export type SystemSettings = {
  exchangeRateUSD: number;
};

export type User = {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'cashier';
};

export type UsdtSaleStatus = 'مدفوعة' | 'غير مدفوعة';

export type UsdtSale = {
  id: string;
  customerName: string;
  usdtAmount: number;
  costPerUsdtUSD: number;
  sellingPricePerUsdtLYD: number;
  totalCostLYD: number;
  totalSaleLYD: number;
  profitLYD: number;
  date: any;
  status: UsdtSaleStatus;
};
