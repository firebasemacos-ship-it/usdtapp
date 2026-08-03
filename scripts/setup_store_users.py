import pg8000.native

HOST = "aws-0-eu-west-3.pooler.supabase.com"
PORT = 5432
DATABASE = "postgres"
USER = "postgres.fztwhoslvlluzuqahast"
PASSWORD = "Gz6dnlh3920064400"

print("🔌 Connecting to Supabase PostgreSQL database...")
con = pg8000.native.Connection(
    host=HOST,
    port=PORT,
    database=DATABASE,
    user=USER,
    password=PASSWORD
)

print("🛠️ Creating store_users_v4 table for Sales System...")
con.run("""
CREATE TABLE IF NOT EXISTS public.store_users_v4 (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'كاشير',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.store_users_v4 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for store_users_v4" ON public.store_users_v4;
CREATE POLICY "Enable all access for store_users_v4" ON public.store_users_v4 FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.store_users_v4 (id, username, password, role, phone)
VALUES 
  ('suser_1', 'زاكي', '123', 'كاشير', '0912345678'),
  ('suser_2', 'مدير_المتجر', 'admin123', 'مدير', '0900000000'),
  ('suser_3', 'admin', 'admin123', 'مدير', '0900000000')
ON CONFLICT (username) DO UPDATE 
SET role = EXCLUDED.role, password = EXCLUDED.password;
""")

print("✅ Successfully created store_users_v4 table and seeded store users!")
con.close()
