'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from '@/lib/supabaseClient';
import { imageMetaRepository } from '@/repositories/imageMetaRepository';
import { imageThumbnailRepository } from '@/repositories/imageThumbnailRepository';
import type { ImageMeta } from '@/types/imageMeta';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/**
 * サムネイル一覧ページ
 * - 画像アップロード（ドラッグ＆ドロップ/クリック）
 * - サムネイル最大2枚表示
 */
export default function ThumbnailsPage() {
  const [thumbnails, setThumbnails] = useState<ImageMeta[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false); // ドラッグ中状態
  const dragCounter = useRef(0); // dragenter/dragleaveのネスト対策
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, loading: userLoading } = useCurrentUser();

  // 初回マウント時にサムネイルを取得
  useEffect(() => {
    const fetchThumbnails = async () => {
      if (!user) return;
      // サムネイル情報を取得
      const { data: thumbRows, error: thumbError } = await supabase
        .from('pin_comment_image_thumbnails')
        .select('image_meta_id')
        .eq('user_id', user.id);
      if (thumbError || !thumbRows) return;
      if (thumbRows.length === 0) {
        setThumbnails([]);
        return;
      }
      // image_meta_id で image_metas を取得
      const metaIds = thumbRows.map((row) => row.image_meta_id);
      const { data: metas, error: metaError } = await supabase
        .from('pin_comment_image_metas')
        .select('*')
        .in('id', metaIds);
      if (metaError || !metas) return;
      // 最大2件まで
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
      // uuid生成
      const uuid = crypto.randomUUID();
      const ext = file.name.split('.').pop();
      const fileName = `${uuid}.${ext}`;
      const storagePath = `${user.id}/${fileName}`;
      // Storageへアップロード
      const { error: uploadError } = await supabase.storage
        .from('pin-comment-images')
        .upload(storagePath, file, { upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;
      // 画像サイズ取得
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = URL.createObjectURL(file);
      });
      // StorageのパブリックURL
      const { data: publicUrlData } = supabase.storage
        .from('pin-comment-images')
        .getPublicUrl(storagePath);
      const publicUrl = publicUrlData.publicUrl;
      // ImageMeta作成
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
      // ImageThumbnail作成
      const thumbInput = {
        userId: user.id,
        imageMetaId: meta.id,
      };
      await imageThumbnailRepository.create(thumbInput);
      setThumbnails((prev) => (prev.length < 2 ? [...prev, meta] : prev));
    } catch (error) {
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  // ドロップ領域のクリックでファイル選択
  const handleDropAreaClick = () => {
    document.getElementById('thumbnail-file-input')?.click();
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
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  // サムネイルエリアのサイズ
  const THUMB_SIZE = 240;

  // サムネイルエリアを生成
  const renderThumbnailArea = (idx: number) => {
    const hasImage = thumbnails[idx] !== undefined;
    return (
      <div
        key={idx}
        className={`relative flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition min-w-[240px] min-h-[240px] w-[240px] h-[240px] ${
          isDragActive && !hasImage
            ? 'bg-blue-100 border-blue-500 shadow-lg scale-105'
            : 'bg-gray-50 hover:bg-gray-100'
        }`}
        style={{ aspectRatio: '1/1' }}
        onClick={() => !hasImage && inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!hasImage) setIsDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragActive(false);
        }}
      >
        {uploading && idx === thumbnails.length ? (
          // アップロード中はスピナー表示（新規追加枠のみ）
          <div className='flex flex-col items-center justify-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mb-2' />
            <span className='text-blue-500 font-medium mt-2'>
              アップロード中...
            </span>
          </div>
        ) : hasImage ? (
          <>
            <Image
              src={thumbnails[idx].thumbnail_url}
              alt='thumbnail'
              width={THUMB_SIZE}
              height={THUMB_SIZE}
              className='object-contain w-full h-full rounded-lg'
            />
            {/* 削除ボタン */}
            <button
              type='button'
              className='absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100 transition z-10'
              aria-label='サムネイル削除'
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteThumbnail(idx);
              }}
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='none'
                aria-hidden='true'
              >
                <circle cx='10' cy='10' r='10' fill='#fff' />
                <path
                  d='M7 7l6 6M13 7l-6 6'
                  stroke='#e11d48'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </svg>
            </button>
          </>
        ) : (
          <span
            className={`text-center select-none transition font-medium ${
              isDragActive ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {isDragActive
              ? '画像をここにドロップ'
              : '画像をここにドロップ\nまたはクリックで選択'}
          </span>
        )}
      </div>
    );
  };

  // 全画面でドラッグ状態を検知
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current++;
      setIsDragActive(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        setIsDragActive(false);
        dragCounter.current = 0;
      }
    };
    const handleDrop = (e: DragEvent) => {
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

  return (
    <main className='flex flex-col items-center justify-center min-h-screen'>
      <div className='flex gap-8'>
        {[...Array(thumbnails.length === 0 || uploading ? 1 : 2)].map(
          (_, idx) => renderThumbnailArea(idx)
        )}
      </div>
      {/* 非表示のファイル選択input */}
      <input
        ref={inputRef}
        id='thumbnail-file-input'
        type='file'
        accept='image/*'
        className='hidden'
        onChange={(e) => handleFiles(e.target.files)}
        disabled={thumbnails.length >= 2 || uploading || userLoading}
      />
    </main>
  );
}
