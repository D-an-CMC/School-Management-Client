import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  const headers: Record<string, string> = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  };

  // Scan information_schema
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/information_schema/tables?table_schema=eq.public&select=table_name,table_type,row_count_estimate`,
      { headers }
    );
    const text = await res.text();
    return NextResponse.json({ status: res.status, body: text.slice(0, 5000) }, {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
