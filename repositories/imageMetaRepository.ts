import { supabase } from '@/lib/supabaseClient';
import { ImageMeta } from '@/types/imageMeta';
import type { ImageMetaCamel } from '../types/imageMeta';
import { fromSnakeCaseImageMeta } from '../utils/imageMetaCaseConvert';

/**
 * 画像メタデータを保存するリポジトリ
 */
export const imageMetaRepository = {
  /**
   * 画像メタデータを新規作成
   * @param meta ImageMeta（id, created_at, updated_atはDB側で自動生成）
   * @returns 作成されたImageMeta
   */
  async create(
    meta: Omit<ImageMeta, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ImageMeta> {
    const { data, error } = await supabase
      .from('pin_comment_image_metas')
      .insert([meta])
      .select()
      .single();
    if (error) throw error;
    return data as ImageMeta;
  },
  /**
   * 指定IDの画像メタデータを取得
   */
  async fetchById(id: string): Promise<{ data: ImageMeta | null; error: any }> {
    const { data, error } = await supabase
      .from('pin_comment_image_metas')
      .select('*')
      .eq('id', id)
      .single();
    return { data: data as ImageMeta | null, error };
  },
  /**
   * 指定IDの画像メタデータを取得（キャメルケース変換済みを返す）
   */
  async fetchByIdCamel(
    id: string
  ): Promise<{ data: ImageMetaCamel | null; error: any }> {
    const { data, error } = await supabase
      .from('pin_comment_image_metas')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return { data: null, error };
    return { data: fromSnakeCaseImageMeta(data), error: null };
  },
};
