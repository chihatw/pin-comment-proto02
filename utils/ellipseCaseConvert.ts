import type { Ellipse } from '../types/ellipse';

/**
 * Supabase の pin_comment_ellipses テーブル行型
 * スネークケースで定義
 */
export type SupabaseEllipseRow = {
  id: string;
  image_meta_id: string;
  center_x: number;
  center_y: number;
  rx: number;
  ry: number;
  created_at: string;
  updated_at: string;
  index: number;
  comment: string;
};

/**
 * Ellipse（キャメルケース）→ SupabaseEllipseRow（スネークケース）
 */
export function toSnakeCaseEllipse(e: Ellipse): SupabaseEllipseRow {
  return {
    id: e.id,
    image_meta_id: e.imageMetaId,
    center_x: e.centerX,
    center_y: e.centerY,
    rx: e.rx,
    ry: e.ry,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
    index: e.index,
    comment: e.comment,
  };
}

/**
 * SupabaseEllipseRow（スネークケース）→ Ellipse（キャメルケース）
 */
export function fromSnakeCaseEllipse(row: SupabaseEllipseRow): Ellipse {
  return {
    id: row.id,
    imageMetaId: row.image_meta_id,
    centerX: row.center_x,
    centerY: row.center_y,
    rx: row.rx,
    ry: row.ry,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    index: row.index,
    comment: row.comment,
  };
}
