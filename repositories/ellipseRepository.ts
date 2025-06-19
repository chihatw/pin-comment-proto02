import { supabase } from '../lib/supabaseClient';
import type { Ellipse } from '../types/ellipse';
import {
  fromSnakeCaseEllipse,
  toSnakeCaseEllipse,
  type SupabaseEllipseRow,
} from '../utils/ellipseCaseConvert';

/**
 * 楕円データのリポジトリ（Supabase CRUD 実装）
 */

/**
 * 楕円リストを取得（Supabase版）
 * @returns {Promise<Ellipse[]>}
 */
export async function getEllipses(imageMetaId: string): Promise<Ellipse[]> {
  const { data, error } = await supabase
    .from('pin_comment_ellipses')
    .select('*')
    .eq('image_meta_id', imageMetaId) // 画像メタIDでフィルタリング
    .order('index', { ascending: true });
  if (error) {
    console.error('[getEllipses] Supabase error:', error);
    return [];
  }
  if (!data) return [];
  return data.map(fromSnakeCaseEllipse);
}

/**
 * 楕円リストを保存（Supabase版: 全件入れ替え）
 * @param ellipses 保存する楕円リスト
 * @param caller 呼び出し元識別用ラベル
 */
export async function saveEllipses(
  ellipses: Ellipse[],
  caller: string
): Promise<void> {
  // 既存データ全削除 → 新規挿入（トランザクション的な一括更新）
  // Supabaseのdelete()はWHERE句必須のため、image_meta_idごとに削除する
  if (ellipses.length > 0) {
    const imageMetaId = ellipses[0].imageMetaId;
    const { error: delError } = await supabase
      .from('pin_comment_ellipses')
      .delete()
      .eq('image_meta_id', imageMetaId);
    if (delError) {
      console.error('[saveEllipses] delete error:', delError);
      return;
    }
    const rows: SupabaseEllipseRow[] = ellipses.map(toSnakeCaseEllipse);
    const { error: insError } = await supabase
      .from('pin_comment_ellipses')
      .insert(rows);
    if (insError) {
      console.error('[saveEllipses] insert error:', insError);
      return;
    }
    console.log(`[saveEllipses] called from: ${caller}`);
  }
}
