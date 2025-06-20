/**
 * 画像メタデータ型定義
 *
 * - id: uuid 形式の一意なID
 * - storage_path: Supabase Storage 上のファイルパス
 * - file_name: 元のファイル名
 * - mime_type: 画像のMIMEタイプ
 * - size: ファイルサイズ（バイト）
 * - created_at, updated_at: ISO 8601 形式の日時文字列
 * - width, height: 画像のピクセルサイズ
 */

export type ImageMeta = {
  /** uuid 形式の一意なID */
  id: string;
  /** Supabase Storage 上のファイルパス */
  storage_path: string;
  /** 元のファイル名 */
  file_name: string;
  /** 画像の MIME タイプ */
  mime_type: string;
  /** ファイルサイズ（バイト） */
  size: number;
  /** 作成日時（ISO 8601 形式） */
  created_at: string;
  /** 更新日時（ISO 8601 形式） */
  updated_at: string;
  /** 画像の幅（ピクセル） */
  width: number;
  /** 画像の高さ（ピクセル） */
  height: number;
  /** サムネイル画像のURL */
  thumbnail_url: string;
};

/**
 * アプリ内で利用するキャメルケース型
 */
export type ImageMetaCamel = {
  id: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  width: number;
  height: number;
  thumbnailUrl: string;
};
