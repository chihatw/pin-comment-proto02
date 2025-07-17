import { supabase } from '@/lib/supabaseClient';
import { ImageThumbnail } from '@/types/imageThumbnail';

/**
 * 画像サムネイル情報を保存するリポジトリ
 */
export const imageThumbnailRepository = {
  /**
   * サムネイル情報を新規作成
   * @param thumbnail ImageThumbnail（id, createdAtはDB側で自動生成）
   * @returns 作成されたImageThumbnail
   */
  async create(
    thumbnail: Omit<ImageThumbnail, 'id' | 'createdAt'>
  ): Promise<ImageThumbnail> {
    // キャメルケース→スネークケース変換
    const dbInput = {
      user_id: thumbnail.userId,
      image_meta_id: thumbnail.imageMetaId,
    };
    const { data, error } = await supabase
      .from('pin_comment_image_thumbnails')
      .insert([dbInput])
      .select('*') // selectの引数を'*'に修正
      .single();
    if (error) throw error;
    return data as ImageThumbnail;
  },

  /**
   * サムネイル情報を imageMetaId で削除
   * @param imageMetaId 紐付く画像メタID
   */
  async deleteByImageMetaId(imageMetaId: string): Promise<void> {
    const { error } = await supabase
      .from('pin_comment_image_thumbnails')
      .delete()
      .eq('image_meta_id', imageMetaId);
    if (error) throw error;
  },

  /**
   * サムネイル・画像メタ・Storage画像をまとめて削除
   * @param imageMeta ImageMeta型（storage_path, id必須）
   */
  async deleteAllRelated(imageMeta: {
    id: string;
    storage_path: string;
  }): Promise<void> {
    // 1. サムネイルレコード削除
    const { error: thumbError } = await supabase
      .from('pin_comment_image_thumbnails')
      .delete()
      .eq('image_meta_id', imageMeta.id);
    if (thumbError) throw thumbError;

    // 2. 画像メタレコード削除
    const { error: metaError } = await supabase
      .from('pin_comment_image_metas')
      .delete()
      .eq('id', imageMeta.id);
    if (metaError) throw metaError;

    // 3. Storage画像削除
    const { error: storageError } = await supabase.storage
      .from('pin-comment-images')
      .remove([imageMeta.storage_path]);
    if (storageError) throw storageError;
  },

  /**
   * 指定ユーザーのサムネイル一覧を取得
   * @param userId ユーザーID
   * @returns ImageThumbnail[]
   */
  async fetchByUserId(userId: string): Promise<ImageThumbnail[]> {
    const { data, error } = await supabase
      .from('pin_comment_image_thumbnails')
      .select('*')
      .order('created_at', { ascending: true })
      .eq('user_id', userId);
    if (error) throw error;
    // スネークケース→キャメルケース変換
    // 型安全のため any で受けて変換
    const { fromSnakeCaseImageThumbnail } = await import(
      '../utils/imageThumbnailCaseConvert'
    );
    return (data as any[]).map(fromSnakeCaseImageThumbnail);
  },
};
