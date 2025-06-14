import type { ImageMeta } from '@/types/imageMeta';

/**
 * 開発用の固定画像メタデータ
 *
 * 本データは開発・テスト用途でのみ利用してください。
 */
export const mockImageMeta: ImageMeta = {
  id: 'ce12bde1-558c-421b-a523-76965d338b53',
  storage_path: '/screenshot 2025-06-14 13.13.45.png', // public/ 配下のパスに修正
  file_name: 'screenshot 2025-06-14 13.13.45.png',
  mime_type: 'image/png',
  size: 449368,
  created_at: '2025-06-14T04:15:14.618Z',
  updated_at: '2025-06-14T04:15:14.618Z',
  width: 1667,
  height: 978,
};

/**
 * Next.js 画像表示用のURLを返すユーティリティ
 * public/ 配下の画像は '/ファイル名' で参照
 */
export function getMockImageUrl(): string {
  return '/screenshot 2025-06-14 13.13.45.png';
}
