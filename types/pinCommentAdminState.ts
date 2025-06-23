/**
 * pin_comment_admin_state テーブルの型定義
 *
 * - id: uuid 形式の一意なID（string型、例: "b1e2..."）
 * - selected_image_meta_id: 画像メタID（string型、またはnull）
 * - selected_ellipse_ids: 選択中の楕円IDリスト（string[]型、またはnull）
 * - blur: ぼかし強度（number型、またはnull）
 * - gradient: グラデーション強度（number型、またはnull）
 * - position_y: Y座標位置（number型、またはnull）
 * - updated_at: 最終更新日時（ISO 8601形式の文字列、またはnull）
 */
export type PinCommentAdminState = {
  id: string;
  selected_image_meta_id: string | null;
  selected_ellipse_ids: string[] | null;
  blur: number | null;
  gradient: number | null;
  position_y: number | null;
  updated_at: string | null;
};
