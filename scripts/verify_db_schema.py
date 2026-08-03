import pg8000.native
import json

HOST = "aws-0-eu-west-3.pooler.supabase.com"
PORT = 5432
DATABASE = "postgres"
USER = "postgres.fztwhoslvlluzuqahast"
PASSWORD = "Gz6dnlh3920064400"

print("🔌 Connecting to Supabase PostgreSQL database...")

try:
    con = pg8000.native.Connection(
        host=HOST,
        port=PORT,
        database=DATABASE,
        user=USER,
        password=PASSWORD
    )
    print("✅ Successfully connected to Supabase PostgreSQL database!")

    # 1. Fetch all tables in public schema
    query_tables = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
    """
    tables = [row[0] for row in con.run(query_tables)]
    print(f"\n📊 Total Tables Found ({len(tables)}):")
    for t in tables:
        count_res = con.run(f'SELECT COUNT(*) FROM public."{t}";')
        print(f"  - Table: {t:<22} | Row Count: {count_res[0][0]}")

    # 2. Detailed verification of expected 15 tables
    expected_tables = [
        "users_v4", "managers_v4", "representatives_v4", "orders_v4", 
        "tempOrders_v4", "transactions_v4", "conversations_v4", "notifications_v4",
        "settings_v4", "expenses_v4", "deposits_v4", "externalDebts_v4", 
        "creditors_v4", "manual_labels_v4", "instant_sales_v4"
    ]

    missing = [t for t in expected_tables if t not in tables]
    if missing:
        print(f"\n⚠️ Missing Tables: {missing}")
    else:
        print("\n🎉 ALL 15 EXPECTED TABLES ARE 100% PRESENT IN SUPABASE DATABASE!")

    con.close()
except Exception as e:
    print(f"❌ Connection or verification error: {e}")
