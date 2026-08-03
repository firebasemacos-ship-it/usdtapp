-- ========================================================
-- USDT STORE & TrendPOS - Complete Unified Database Schema (20 Tables)
-- Database: Supabase PostgreSQL (Port 5432)
-- ========================================================

-- --------------------------------------------------------
-- 1. SHIPPING & LOGISTICS TABLES (نظام الشحن والخدمات)
-- --------------------------------------------------------

-- 1. users_v4 (العملاء والزبائن)
CREATE TABLE IF NOT EXISTS public.users_v4 (
    id TEXT PRIMARY KEY,
    name TEXT,
    username TEXT,
    password TEXT,
    phone TEXT,
    address TEXT,
    "orderCount" NUMERIC DEFAULT 0,
    debt NUMERIC DEFAULT 0,
    "orderCounter" NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. managers_v4 (المدراء والإدارة)
CREATE TABLE IF NOT EXISTS public.managers_v4 (
    id TEXT PRIMARY KEY,
    name TEXT,
    username TEXT,
    password TEXT,
    phone TEXT,
    permissions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. representatives_v4 (المندوبون)
CREATE TABLE IF NOT EXISTS public.representatives_v4 (
    id TEXT PRIMARY KEY,
    name TEXT,
    username TEXT,
    password TEXT,
    phone TEXT,
    "assignedOrders" NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. orders_v4 (الطلبيات والشحنات الرئيسية)
CREATE TABLE IF NOT EXISTS public.orders_v4 (
    id TEXT PRIMARY KEY,
    "invoiceNumber" TEXT,
    "trackingId" TEXT,
    "userId" TEXT,
    "customerName" TEXT,
    "operationDate" TEXT,
    "sellingPriceLYD" NUMERIC,
    "remainingAmount" NUMERIC,
    status TEXT,
    "productLinks" TEXT,
    "exchangeRate" NUMERIC,
    "purchasePriceUSD" NUMERIC,
    "downPaymentLYD" NUMERIC,
    "weightKG" NUMERIC,
    "pricePerKilo" NUMERIC,
    "pricePerKiloCurrency" TEXT,
    "customerWeightCost" NUMERIC,
    "customerWeightCostCurrency" TEXT,
    "addedCostUSD" NUMERIC,
    "addedCostNotes" TEXT,
    store TEXT,
    "paymentMethod" TEXT,
    "deliveryDate" TEXT,
    "itemDescription" TEXT,
    "shippingCostLYD" NUMERIC,
    "representativeId" TEXT,
    "representativeName" TEXT,
    "customerAddress" TEXT,
    "customerPhone" TEXT,
    "collectedAmount" NUMERIC,
    "customerWeightCostUSD" NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. tempOrders_v4 (الطلبيات المؤقتة)
CREATE TABLE IF NOT EXISTS public."tempOrders_v4" (
    id TEXT PRIMARY KEY,
    "invoiceName" TEXT,
    "totalAmount" NUMERIC,
    "remainingAmount" NUMERIC,
    status TEXT,
    "subOrders" JSONB,
    "createdAt" TEXT,
    "assignedUserId" TEXT,
    "assignedUserName" TEXT,
    "parentInvoiceId" TEXT
);

-- 6. transactions_v4 (المعاملات المالية والدفعات)
CREATE TABLE IF NOT EXISTS public.transactions_v4 (
    id TEXT PRIMARY KEY,
    "orderId" TEXT,
    "customerId" TEXT,
    "customerName" TEXT,
    date TEXT,
    type TEXT,
    status TEXT,
    amount NUMERIC,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. conversations_v4 (محادثات الدعم الفني)
CREATE TABLE IF NOT EXISTS public.conversations_v4 (
    id TEXT PRIMARY KEY,
    "userId" TEXT,
    "userName" TEXT,
    "userAvatar" TEXT,
    "lastMessage" TEXT,
    "lastMessageTime" TEXT,
    "unreadCount" NUMERIC,
    messages JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. notifications_v4 (الإشعارات)
CREATE TABLE IF NOT EXISTS public.notifications_v4 (
    id TEXT PRIMARY KEY,
    message TEXT,
    target TEXT,
    "userId" TEXT,
    timestamp TEXT,
    "isRead" BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. settings_v4 (إعدادات أسعار الصرف والكيلو)
CREATE TABLE IF NOT EXISTS public.settings_v4 (
    id TEXT PRIMARY KEY,
    "exchangeRate" NUMERIC,
    "pricePerKiloLYD" NUMERIC,
    "pricePerKiloUSD" NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. expenses_v4 (المصاريف التشغيلية)
CREATE TABLE IF NOT EXISTS public.expenses_v4 (
    id TEXT PRIMARY KEY,
    description TEXT,
    amount NUMERIC,
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. deposits_v4 (الإيداعات المالية)
CREATE TABLE IF NOT EXISTS public.deposits_v4 (
    id TEXT PRIMARY KEY,
    "receiptNumber" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    amount NUMERIC,
    date TEXT,
    description TEXT,
    status TEXT,
    "representativeId" TEXT,
    "representativeName" TEXT,
    "collectedBy" TEXT,
    "collectedDate" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. externalDebts_v4 (الديون الخارجية)
CREATE TABLE IF NOT EXISTS public."externalDebts_v4" (
    id TEXT PRIMARY KEY,
    "creditorId" TEXT,
    "creditorName" TEXT,
    amount NUMERIC,
    date TEXT,
    status TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. creditors_v4 (سجل الدائنين والشركات)
CREATE TABLE IF NOT EXISTS public.creditors_v4 (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    currency TEXT,
    "totalDebt" NUMERIC,
    "contactInfo" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. manual_labels_v4 (ملصقات الشحن اليدوية)
CREATE TABLE IF NOT EXISTS public.manual_labels_v4 (
    id TEXT PRIMARY KEY,
    "invoiceNumber" TEXT,
    "operationDate" TEXT,
    "customerName" TEXT,
    "customerAddress" TEXT,
    "customerPhone" TEXT,
    "itemDescription" TEXT,
    "trackingId" TEXT,
    "sellingPriceLYD" NUMERIC,
    "remainingAmount" NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 2. DIRECT SALES & POS SYSTEM TABLES (نظام المبيعات المباشرة - trendpos)
-- --------------------------------------------------------

-- 15. instant_sales_v4 (المبيعات المباشرة والفورية - USDT STORE)
CREATE TABLE IF NOT EXISTS public.instant_sales_v4 (
    id TEXT PRIMARY KEY,
    "productName" TEXT,
    "costUSD" NUMERIC,
    "costExchangeRate" NUMERIC,
    "totalCostLYD" NUMERIC,
    "salePriceMode" TEXT,
    "salePriceLYD" NUMERIC,
    "salePriceUSD" NUMERIC,
    "saleExchangeRate" NUMERIC,
    "finalSalePriceLYD" NUMERIC,
    "netProfit" NUMERIC,
    "createdAt" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. usdt_sales_v4 (سجل مبيعات USDT والديون)
CREATE TABLE IF NOT EXISTS public.usdt_sales_v4 (
    id TEXT PRIMARY KEY,
    "customerName" TEXT,
    "usdtAmount" NUMERIC,
    "costPerUsdtUSD" NUMERIC,
    "sellingPricePerUsdtLYD" NUMERIC,
    "totalCostLYD" NUMERIC,
    "totalSaleLYD" NUMERIC,
    "profitLYD" NUMERIC,
    status TEXT DEFAULT 'غير مدفوعة',
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. cards_v4 (بطاقات الشحن والتعبئة)
CREATE TABLE IF NOT EXISTS public.cards_v4 (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    "costUSD" NUMERIC,
    "priceLYD" NUMERIC,
    "stockQty" NUMERIC DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. facebook_packages_v4 (باقات ترويج منشورات فيسبوك)
CREATE TABLE IF NOT EXISTS public.facebook_packages_v4 (
    id TEXT PRIMARY KEY,
    "packageName" TEXT,
    "priceUSD" NUMERIC,
    "priceLYD" NUMERIC,
    "durationDays" NUMERIC,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. store_categories_v4 (تصنيفات منتجات المتجر)
CREATE TABLE IF NOT EXISTS public.store_categories_v4 (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. store_invoices_v4 (أرشيف فواتير المتجر)
CREATE TABLE IF NOT EXISTS public.store_invoices_v4 (
    id TEXT PRIMARY KEY,
    "invoiceNumber" TEXT,
    "customerName" TEXT,
    "totalLYD" NUMERIC,
    "totalUSD" NUMERIC,
    items JSONB,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- Enable Row Level Security (RLS) & Access Policies for ALL 20 Tables
-- ========================================================
ALTER TABLE public.users_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managers_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.representatives_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."tempOrders_v4" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."externalDebts_v4" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creditors_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_labels_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instant_sales_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usdt_sales_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_packages_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_categories_v4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_invoices_v4 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for all users" ON public.users_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.managers_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.representatives_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.orders_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public."tempOrders_v4";
DROP POLICY IF EXISTS "Enable all access for all users" ON public.transactions_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.conversations_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.notifications_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.settings_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.expenses_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.deposits_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public."externalDebts_v4";
DROP POLICY IF EXISTS "Enable all access for all users" ON public.creditors_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.manual_labels_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.instant_sales_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.usdt_sales_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.cards_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.facebook_packages_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.store_categories_v4;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.store_invoices_v4;

CREATE POLICY "Enable all access for all users" ON public.users_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.managers_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.representatives_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.orders_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public."tempOrders_v4" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.transactions_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.conversations_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.notifications_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.settings_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.expenses_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.deposits_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public."externalDebts_v4" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.creditors_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.manual_labels_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.instant_sales_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.usdt_sales_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.cards_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.facebook_packages_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.store_categories_v4 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.store_invoices_v4 FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- Insert Default Records
-- ========================================================
INSERT INTO public.managers_v4 (id, name, username, password, phone, permissions)
VALUES ('admin', 'مدير النظام الرئيسي', 'admin', 'admin123', '0900000000', ARRAY['all'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.settings_v4 (id, "exchangeRate", "pricePerKiloLYD", "pricePerKiloUSD")
VALUES ('default_settings', 7.0, 30.0, 4.5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.store_categories_v4 (id, name, description)
VALUES 
  ('cat_1', 'عملات رقمية', 'شحن وحسابات USDT'),
  ('cat_2', 'بطاقات دفع', 'بطاقات فيزا وماستركارد افتراضية'),
  ('cat_3', 'إعلانات ممولة', 'باقات ترويج وتزويد صفحات فيسبوك')
ON CONFLICT (id) DO NOTHING;
