/**
 * pin_comment_admin_state テーブルの型定義
 *
 * - id: uuid 形式の一意なID
 * - selected_image_meta_id: text | null
 * - selected_ellipse_ids: text[] | null
 * - updated_at: ISO 8601 形式の日時文字列 | null
 */
export type PinCommentAdminState = {
  id: string;
  selected_image_meta_id: string | null;
  selected_ellipse_ids: string[] | null;
  updated_at: string | null;
};
