/**
 * 楕円コメントのリポジトリ（localStorage管理、将来DB移行を想定）
 */
import type { EllipseComment } from '@/types/comment';

const STORAGE_KEY = 'ellipseComments';

/**
 * コメント一覧を取得
 */
export async function getEllipseComments(): Promise<EllipseComment[]> {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as EllipseComment[];
  } catch {
    return [];
  }
}

/**
 * コメント一覧を保存
 */
export async function saveEllipseComments(
  comments: EllipseComment[]
): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}
