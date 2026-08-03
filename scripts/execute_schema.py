import pg8000
import sys

host = "aws-0-eu-west-3.pooler.supabase.com"
port = 5432
database = "postgres"
user = "postgres.fztwhoslvlluzuqahast"
password = sys.argv[1] if len(sys.argv) > 1 else ""

if not password:
    print("Please provide the database password as argument: python3 execute_schema.py <password>")
    sys.exit(1)

try:
    print(f"Connecting to Supabase PostgreSQL DB at {host}:{port} as {user}...")
    conn = pg8000.connect(
        host=host,
        port=port,
        database=database,
        user=user,
        password=password,
        ssl_context=True
    )
    cursor = conn.cursor()
    
    print("Reading schema_all_tables.sql...")
    with open("schema_all_tables.sql", "r", encoding="utf-8") as f:
        sql = f.read()

    print("Executing database creation script...")
    cursor.execute(sql)
    conn.commit()
    print("SUCCESS: All 15 tables, policies, indexes and seed data created successfully!")
    cursor.close()
    conn.close()
except Exception as e:
    print("Database Connection/Execution Error:", e)
