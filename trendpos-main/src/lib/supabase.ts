// Supabase REST Helper for trendpos-main Direct Supabase Connection

const SUPABASE_URL = "https://fztwhoslvlluzuqahast.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dHdob3NsdmxsdXp1cWFoYXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY4OTg4MywiZXhwIjoyMTAxMjY1ODgzfQ.AH-Z1ernKnoGtXCfTv2pDv5mh4tgWW9qOnRWgiui-K8";

export async function supabaseFetch(table: string, queryParams: string = '') {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${queryParams}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      cache: 'no-store'
    });
    if (!res.ok) {
      console.error(`Supabase fetch error on ${table}:`, await res.text());
      return [];
    }
    return await res.json();
  } catch (e) {
    console.error(`Supabase network error on ${table}:`, e);
    return [];
  }
}

export async function supabaseInsert(table: string, data: any) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      console.error(`Supabase insert error on ${table}:`, await res.text());
      return null;
    }
    const result = await res.json();
    return result[0] || result;
  } catch (e) {
    console.error(`Supabase insert network error on ${table}:`, e);
    return null;
  }
}

export async function supabaseUpdate(table: string, id: string, data: any) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      console.error(`Supabase update error on ${table}:`, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error(`Supabase update network error on ${table}:`, e);
    return false;
  }
}

export async function supabaseDelete(table: string, id: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return res.ok;
  } catch (e) {
    console.error(`Supabase delete network error on ${table}:`, e);
    return false;
  }
}
