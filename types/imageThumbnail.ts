/**
 * 画像サムネイル情報
 */
export interface ImageThumbnail {
  /** サムネイルID（uuid） */
  id: string;
  /** ユーザーID（uuid） */
  userId: string | null;
  /** 紐付く画像メタID（uuid） */
  imageMetaId: string | null;
  /** 作成日時（ISO 8601文字列） */
  createdAt: string | null;
}
