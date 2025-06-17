// lib/supabaseClient.ts
/**
 * Supabase クライアントの初期化
 *
 * .env.local に設定した環境変数を利用します。
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
