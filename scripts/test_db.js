const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fztwhoslvlluzuqahast.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dHdob3NsdmxsdXp1cWFoYXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY4OTg4MywiZXhwIjoyMTAxMjY1ODgzfQ.AH-Z1ernKnoGtXCfTv2pDv5mh4tgWW9qOnRWgiui-K8';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testTables() {
    console.log('Testing Supabase tables connection...');
    const tables = [
        'users_v4',
        'managers_v4',
        'representatives_v4',
        'orders_v4',
        'tempOrders_v4',
        'transactions_v4',
        'conversations_v4',
        'notifications_v4',
        'settings_v4',
        'expenses_v4',
        'deposits_v4',
        'externalDebts_v4',
        'creditors_v4',
        'manual_labels_v4',
        'instant_sales_v4'
    ];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('id').limit(1);
        if (error) {
            console.log(`Table '${table}': ERROR/NOT CREATED YET ->`, error.message);
        } else {
            console.log(`Table '${table}': EXISTS & ACCESSIBLE (rows found: ${data.length})`);
        }
    }
}

testTables();
