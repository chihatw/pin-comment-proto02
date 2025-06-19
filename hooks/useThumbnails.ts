import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from '@/lib/supabaseClient';
import { imageMetaRepository } from '@/repositories/imageMetaRepository';
import { imageThumbnailRepository } from '@/repositories/imageThumbnailRepository';
import type { ImageMeta } from '@/types/imageMeta';
import { useEffect, useRef, useState } from 'react';

/**
 * サムネイル一覧・アップロード・削除・ドラッグ状態管理用カスタムフック
 */
export function useThumbnails() {
  const [thumbnails, setThumbnails] = useState<ImageMeta[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);
  const { user, loading: userLoading } = useCurrentUser();

  // サムネイル一覧取得
  useEffect(() => {
    const fetchThumbnails = async () => {
      if (!user) return;
      const { data: thumbRows, error: thumbError } = await supabase
        .from('pin_comment_image_thumbnails')
        .select('image_meta_id')
        .eq('user_id', user.id);
      if (thumbError || !thumbRows) return;
      if (thumbRows.length === 0) {
        setThumbnails([]);
        return;
      }
      const metaIds = thumbRows.map((row) => row.image_meta_id);
      const { data: metas, error: metaError } = await supabase
        .from('pin_comment_image_metas')
        .select('*')
        .in('id', metaIds);
      if (metaError || !metas) return;
      setThumbnails(metas.slice(0, 2));
    };
    if (user) fetchThumbnails();
  }, [user]);

  // ファイル選択/ドロップ時のハンドラ
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || uploading || !user) return;
    setUploading(true);
    try {
      const file = files[0];
      const uuid = crypto.randomUUID();
      const ext = file.name.split('.').pop();
      const fileName = `${uuid}.${ext}`;
      const storagePath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('pin-comment-images')
        .upload(storagePath, file, { upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = URL.createObjectURL(file);
      });
      const { data: publicUrlData } = supabase.storage
        .from('pin-comment-images')
        .getPublicUrl(storagePath);
      const publicUrl = publicUrlData.publicUrl;
      const metaInput = {
        storage_path: storagePath,
        file_name: fileName,
        mime_type: file.type,
        size: file.size,
        width: img.width,
        height: img.height,
        thumbnail_url: publicUrl,
      };
      const meta = await imageMetaRepository.create(metaInput);
      const thumbInput = {
        userId: user.id,
        imageMetaId: meta.id,
      };
      await imageThumbnailRepository.create(thumbInput);
      setThumbnails((prev) => (prev.length < 2 ? [...prev, meta] : prev));
    } catch {
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  // サムネイル削除ハンドラ
  const handleDeleteThumbnail = async (idx: number) => {
    if (!thumbnails[idx] || !user) return;
    const imageMeta = thumbnails[idx];
    try {
      await imageThumbnailRepository.deleteAllRelated({
        id: imageMeta.id,
        storage_path: imageMeta.storage_path,
      });
      setThumbnails((prev) => prev.filter((_, i) => i !== idx));
    } catch {
      alert('削除に失敗しました');
    }
  };

  // 全画面でドラッグ状態を検知
  useEffect(() => {
    const handleDragEnter = () => {
      dragCounter.current++;
      setIsDragActive(true);
    };
    const handleDragLeave = () => {
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        setIsDragActive(false);
        dragCounter.current = 0;
      }
    };
    const handleDrop = () => {
      dragCounter.current = 0;
      setIsDragActive(false);
    };
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  return {
    thumbnails,
    uploading,
    isDragActive,
    setIsDragActive,
    handleFiles,
    handleDeleteThumbnail,
    user,
    userLoading,
  };
}
