'use client';

import { ContainImage } from '@/components/ContainImage';
import { getMockImageUrl, mockImageMeta } from '@/mocks/imageMeta';
import { calcContainSize } from '@/utils/calcContainSize';
import { useEffect, useState } from 'react';

/**
 * /image ページ
 * mocks/imageMeta.ts にある画像をアスペクト比を保って最大表示
 * 画像は public/ 配下に配置されていることを前提とする
 */
export default function ImagePage() {
  const meta = mockImageMeta;
  const url = getMockImageUrl();

  // 画面サイズ取得（クライアントサイドのみ）
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    function update() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!meta) return <div>画像がありません</div>;

  const contain = calcContainSize(
    windowSize.width,
    windowSize.height,
    meta.width,
    meta.height
  );

  return (
    <main className='flex min-h-screen items-center justify-center bg-gray-100'>
      <ContainImage
        src={url}
        alt={meta.file_name}
        width={contain.width}
        height={contain.height}
        priority
      />
    </main>
  );
}
