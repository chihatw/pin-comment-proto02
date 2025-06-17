/**
 * 楕円に紐付くコメントの型定義
 *
 * @property {string} id - コメントのUUID
 * @property {string} ellipseId - 紐付く楕円のUUID
 * @property {string} content - コメント本文
 * @property {string} createdAt - 作成日時（ISO 8601形式）
 * @property {string} updatedAt - 更新日時（ISO 8601形式）
 */
export type EllipseComment = {
  id: string;
  ellipseId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};
