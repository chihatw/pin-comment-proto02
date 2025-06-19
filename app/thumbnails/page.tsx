'use client';

import { ThumbnailWithEllipses } from '@/components/ThumbnailWithEllipses';
import { useThumbnails } from '@/hooks/useThumbnails';
import Link from 'next/link';
import { useRef } from 'react';

/**
 * サムネイル一覧ページ
 * - 画像アップロード（ドラッグ＆ドロップ/クリック）
 * - サムネイル最大2枚表示
 */
export default function ThumbnailsPage() {
  const {
    thumbnails,
    uploading,
    isDragActive,
    setIsDragActive,
    handleFiles,
    handleDeleteThumbnail,
    userLoading,
  } = useThumbnails();
  const inputRef = useRef<HTMLInputElement>(null);

  const THUMB_SIZE = 240;

  // サムネイルエリアを生成
  const renderThumbnailArea = (idx: number) => {
    const hasImage = thumbnails[idx] !== undefined;
    if (!hasImage) {
      return (
        <div
          key={idx}
          className={`relative flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition min-w-[240px] min-h-[240px] w-[240px] h-[240px] ${
            isDragActive
              ? 'bg-blue-100 border-blue-500 shadow-lg scale-105'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
          style={{ aspectRatio: '1/1' }}
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragActive(true);
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
    }
    // サムネイル＋楕円重ね表示
    const imageMeta = thumbnails[idx];
    return (
      <div key={idx} className='relative group'>
        <Link href={`/image/${imageMeta.id}`} className='block w-full h-full'>
          <ThumbnailWithEllipses
            imageMeta={imageMeta}
            thumbnailWidth={THUMB_SIZE}
            thumbnailHeight={THUMB_SIZE}
          />
        </Link>
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
      </div>
    );
  };

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
