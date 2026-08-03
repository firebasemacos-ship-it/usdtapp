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
  orderCount?: number;
  debt?: number;
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
  username?: string;
  password?: string;
  activeOrdersCount?: number;
  completedOrdersCount?: number;
  assignedOrders?: number;
  created_at?: string;
};

export type SubOrder = {
  id?: string;
  subOrderId?: string;
  trackingId?: string;
  username?: string;
  password?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  remainingAmount?: number;
  invoiceName?: string;
  description?: string;
  priceUSD?: number;
  purchasePriceUSD?: number;
  sellingPriceLYD?: number;
  downPaymentLYD?: number;
  paymentMethod?: string;
  shipmentStatus?: string;
  weightKG?: number;
  productLinks?: string;
  selectedStore?: string;
  manualStoreName?: string;
  operationDate?: string;
  deliveryDate?: string;
  itemDescription?: string;
  pricePerKiloUSD?: number;
  representativeId?: string | null;
  representativeName?: string | null;
  status?: string;
};

export type TempOrder = {
  id: string;
  userName?: string;
  customerName?: string;
  userPhone?: string;
  customerPhone?: string;
  customerAddress?: string;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  status?: string;
  invoiceName?: string;
  notes?: string;
  parentInvoiceId?: string;
  items?: SubOrder[];
  subOrders?: SubOrder[];
  totalAmount?: number;
  remainingAmount?: number;
  totalLYD?: number;
  totalUSD?: number;
  created_at?: string;
};

export type Order = {
  id: string;
  orderNumber?: string;
  invoiceNumber?: string;
  userId: string;
  userName?: string;
  customerName?: string;
  userPhone?: string;
  customerPhone?: string;
  customerAddress?: string;
  trackingId?: string;
  description?: string;
  itemDescription?: string;
  operationDate: string;
  deliveryDate?: string;
  purchasePriceUSD: number;
  sellingPriceLYD: number;
  shippingCostLYD: number;
  paidAmountLYD?: number;
  remainingAmount: number;
  collectedAmount?: number;
  weightKG?: number;
  customerWeightCost?: number;
  customerWeightCostUSD?: number;
  customerWeightCostCurrency?: 'LYD' | 'USD';
  companyWeightCostUSD?: number;
  companyWeightCost?: number;
  downPaymentLYD?: number;
  addedCostUSD?: number;
  addedCostNotes?: string;
  status: OrderStatus;
  notes?: string;
  exchangeRate?: number;
  pricePerKilo?: number;
  pricePerKiloLYD?: number;
  pricePerKiloCurrency?: 'LYD' | 'USD';
  store?: string;
  paymentMethod?: string;
  productLinks?: string[] | string;
  representativeId?: string | null;
  representativeName?: string | null;
  created_at?: string;
};

export type Transaction = {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  type: 'payment' | 'charge' | 'refund' | 'order' | string;
  date: string;
  orderId?: string;
  description?: string;
  status?: string;
  notes?: string;
  created_at?: string;
};

export type Expense = {
  id: string;
  title?: string;
  amount: number;
  category?: string;
  date: string;
  description?: string;
  notes?: string;
  created_at?: string;
};

export type DepositStatus = 'pending' | 'completed' | 'cancelled' | string;

export type Deposit = {
  id: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  date: string;
  collectedDate?: string;
  description?: string;
  notes?: string;
  receiptNumber?: string;
  status?: DepositStatus;
  representativeId?: string | null;
  representativeName?: string | null;
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

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  timestamp?: string;
  read?: boolean;
  isRead?: boolean;
  userId?: string;
};

export type Message = {
  id: string;
  senderId?: string;
  senderName?: string;
  sender?: string;
  text: string;
  timestamp: string;
  isAdmin?: boolean;
};

export type Conversation = {
  id: string;
  userId: string;
  userName?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  updatedAt?: string;
  unreadCount?: number;
  messages?: Message[];
};

// --- Sales System (TrendPOS / USDT STORE) Types ---

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

export type TableStatus = 'available' | 'occupied' | 'needs-cleaning';

export type Table = {
  id: number;
  status: TableStatus;
  capacity: number;
};

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
  name?: string;
  phone?: string;
  address?: string;
  password?: string;
  role?: 'admin' | 'cashier' | 'employee' | 'representative' | 'customer';
  orderCount?: number;
  orderCounter?: number;
  debt?: number;
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
