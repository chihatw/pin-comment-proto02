/**
 * 画像メタデータ型定義
 *
 */

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
