import { supabase } from '@/lib/supabaseClient';
import { ImageMeta } from '@/types/imageMeta';

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
};
