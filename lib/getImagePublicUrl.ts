// lib/getImagePublicUrl.ts
/**
 * Supabase Storage から画像のパブリックURLを取得するユーティリティ
 */
import { supabase } from './supabaseClient';

/**
 * 画像のパブリックURLを取得
 * @param bucket バケット名
 * @param path ストレージ内のファイルパス
 * @returns パブリックURL文字列（存在しない場合は null）
 */
export async function getImagePublicUrl(
  bucket: string,
  path: string
): Promise<string | null> {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}
