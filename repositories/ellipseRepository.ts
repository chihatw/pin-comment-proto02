import type { Ellipse } from '../types/ellipse';

/**
 * 楕円データのリポジトリ（localStorage 実装）
 * 将来的な外部DB移行を考慮し、Promiseベースで実装
 */
const STORAGE_KEY = 'ellipses';

/**
 * 楕円リストを取得
 */
export async function getEllipses(): Promise<Ellipse[]> {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  try {
    return JSON.parse(json) as Ellipse[];
  } catch {
    return [];
  }
}

/**
 * 楕円リストを保存
 * @param ellipses 保存する楕円リスト
 * @param caller 呼び出し元識別用ラベル
 */
export async function saveEllipses(
  ellipses: Ellipse[],
  caller: string
): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ellipses));
  console.log(`[saveEllipses] called from: ${caller}`);
}
