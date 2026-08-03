import urllib.request
import json
import ssl

supabase_url = "https://fztwhoslvlluzuqahast.supabase.co"
service_role_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dHdob3NsdmxsdXp1cWFoYXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY4OTg4MywiZXhwIjoyMTAxMjY1ODgzfQ.AH-Z1ernKnoGtXCfTv2pDv5mh4tgWW9qOnRWgiui-K8"

headers = {
    "apikey": service_role_key,
    "Authorization": f"Bearer {service_role_key}",
    "Content-Type": "application/json"
}

context = ssl._create_unverified_context()

# Test creating RPC or running query via Management / REST
def try_query(endpoint, data=None):
    try:
        url = f"{supabase_url}{endpoint}"
        req_data = json.dumps(data).encode('utf-8') if data else None
        req = urllib.request.Request(url, data=req_data, headers=headers, method='POST' if data else 'GET')
        with urllib.request.urlopen(req, context=context) as response:
            print(f"Success on {endpoint}:", response.status, response.read().decode()[:200])
    except urllib.error.HTTPError as e:
        print(f"HTTPError on {endpoint}:", e.code, e.read().decode()[:200])
    except Exception as e:
        print(f"Exception on {endpoint}:", e)

print("--- Testing endpoints ---")
try_query("/rest/v1/rpc/exec_sql", {"query": "SELECT 1;"})
try_query("/rest/v1/users_v4?select=id")
