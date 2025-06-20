// utils/imageMetaCaseConvert.ts
import type { ImageMeta, ImageMetaCamel } from '../types/imageMeta';

/**
 * スネークケース（DB行）→キャメルケース（アプリ用）
 */
export function fromSnakeCaseImageMeta(row: ImageMeta): ImageMetaCamel {
  return {
    id: row.id,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    size: row.size,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    width: row.width,
    height: row.height,
    thumbnailUrl: row.thumbnail_url,
  };
}

/**
 * キャメルケース（アプリ用）→スネークケース（DB行）
 */
export function toSnakeCaseImageMeta(meta: ImageMetaCamel): ImageMeta {
  return {
    id: meta.id,
    storage_path: meta.storagePath,
    file_name: meta.fileName,
    mime_type: meta.mimeType,
    size: meta.size,
    created_at: meta.createdAt,
    updated_at: meta.updatedAt,
    width: meta.width,
    height: meta.height,
    thumbnail_url: meta.thumbnailUrl,
  };
}
