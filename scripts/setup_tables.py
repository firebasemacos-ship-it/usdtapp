import urllib.request
import json
import ssl

supabase_url = "https://fztwhoslvlluzuqahast.supabase.co"
service_role_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dHdob3NsdmxsdXp1cWFoYXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY4OTg4MywiZXhwIjoyMTAxMjY1ODgzfQ.AH-Z1ernKnoGtXCfTv2pDv5mh4tgWW9qOnRWgiui-K8"

# Read schema_all_tables.sql
with open("schema_all_tables.sql", "r", encoding="utf-8") as f:
    sql_script = f.read()

# Try calling Supabase SQL / query API if supported
print("Checking Supabase connection with service_role key...")
req = urllib.request.Request(
    f"{supabase_url}/rest/v1/",
    headers={
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}"
    }
)
try:
    context = ssl._create_unverified_context()
    with urllib.request.urlopen(req, context=context) as response:
        res = response.read().decode()
        print("Connected to Supabase REST API successfully! HTTP 200 OK.")
except Exception as e:
    print("REST API Error:", e)
