/**
 * 楕円（Ellipse）型定義
 *
 * 画像上に楕円を描画するためのデータ構造です。
 *
 * - centerX, centerY, rx, ry は画像サイズに対する割合（0〜1）で管理します。
 * - id は uuid など一意な文字列。
 * - createdAt, updatedAt は ISO 8601 形式の文字列。
 */
export type Ellipse = {
  /** 一意なID（uuidなど） */
  id: string;
  /** 紐付く画像メタ情報ID（uuid、一意な文字列） */
  imageMetaId: string;
  /** 楕円の中心X座標（画像幅に対する割合 0〜1） */
  centerX: number;
  /** 楕円の中心Y座標（画像高さに対する割合 0〜1） */
  centerY: number;
  /** 楕円のX方向半径（画像幅に対する割合 0〜1） */
  rx: number;
  /** 楕円のY方向半径（画像高さに対する割合 0〜1） */
  ry: number;
  /** 作成日時（ISO 8601文字列） */
  createdAt: string;
  /** 更新日時（ISO 8601文字列） */
  updatedAt: string;
  /** 画像ごとの楕円の表示順インデックス（1始まりの連番） */
  index: number;
  /** コメント本文 */
  comment: string;
};
