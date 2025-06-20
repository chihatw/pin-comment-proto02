// utils/imageThumbnailCaseConvert.ts
import type { ImageThumbnail } from '../types/imageThumbnail';

/**
 * Supabase の pin_comment_image_thumbnails テーブル行型
 * スネークケースで定義
 */
export type SupabaseImageThumbnailRow = {
  id: string;
  user_id: string | null;
  image_meta_id: string | null;
  created_at: string | null;
};

/**
 * ImageThumbnail（キャメルケース）→ SupabaseImageThumbnailRow（スネークケース）
 */
export function toSnakeCaseImageThumbnail(
  t: ImageThumbnail
): SupabaseImageThumbnailRow {
  return {
    id: t.id,
    user_id: t.userId,
    image_meta_id: t.imageMetaId,
    created_at: t.createdAt,
  };
}

/**
 * SupabaseImageThumbnailRow（スネークケース）→ ImageThumbnail（キャメルケース）
 */
export function fromSnakeCaseImageThumbnail(
  row: SupabaseImageThumbnailRow
): ImageThumbnail {
  return {
    id: row.id,
    userId: row.user_id,
    imageMetaId: row.image_meta_id,
    createdAt: row.created_at,
  };
}
