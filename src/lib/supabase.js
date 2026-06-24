import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client-side Supabase client (for browser)
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase client with service role (for API routes)
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Supabaseの1000行デフォルト制限を回避して全行を取得するヘルパー
 * Supabase JS v2 の .select() はデフォルトで最大1000行しか返さないため、
 * .range() を使ったページネーションで全件を取得する。
 *
 * @param {object} query - Supabaseのクエリビルダー（.select() + フィルタ まで構築済み）
 * @param {number} pageSize - 1ページあたりの取得件数（デフォルト1000、最大1000）
 * @returns {Promise<{data: Array, error: any}>}
 */
export async function fetchAllRows(query, pageSize = 1000) {
  let allData = [];
  let from = 0;
  while (true) {
    const { data, error } = await query.range(from, from + pageSize - 1);
    if (error) return { data: null, error };
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < pageSize) break; // 最終ページ
    from += pageSize;
  }
  return { data: allData, error: null };
}
