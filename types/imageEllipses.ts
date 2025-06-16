/**
 * 画像ごとに紐付く楕円リストの型定義
 *
 * 1枚の画像（imageId）に複数の楕円（Ellipse型）を紐付けて管理します。
 */
import type { Ellipse } from './ellipse';

export type ImageEllipses = {
  /** 画像ID（uuidやファイル名など一意な文字列） */
  imageId: string;
  /** この画像に紐付く楕円リスト（最大10個程度を想定） */
  ellipses: Ellipse[];
};
