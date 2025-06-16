'use client';

import { ContainImage } from '@/components/ContainImage';
import { getMockImageUrl, mockImageMeta } from '@/mocks/imageMeta';
import { calcContainSize } from '@/utils/calcContainSize';
import { useEffect, useRef, useState } from 'react';

/**
 * /image ページ
 * mocks/imageMeta.ts にある画像をアスペクト比を保って最大表示
 * 画像は public/ 配下に配置されていることを前提とする
 */
export default function ImagePage() {
  const meta = mockImageMeta;
  const url = getMockImageUrl();

  // メインカラムのサイズを取得
  const mainColRef = useRef<HTMLDivElement>(null);
  const [mainColSize, setMainColSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateMainColSize() {
      if (mainColRef.current) {
        setMainColSize({
          width: mainColRef.current.clientWidth,
          height: mainColRef.current.clientHeight,
        });
      }
    }
    updateMainColSize();
    window.addEventListener('resize', updateMainColSize);
    return () => window.removeEventListener('resize', updateMainColSize);
  }, []);

  if (!meta) return <div>画像がありません</div>;

  const contain = calcContainSize(
    mainColSize.width,
    mainColSize.height,
    meta.width,
    meta.height
  );

  return (
    <main className='w-screen h-screen overflow-hidden'>
      <div className='grid grid-cols-[minmax(0,1fr)_320px] w-full h-full'>
        {/* メインカラム: 画像と楕円 */}
        <div
          ref={mainColRef}
          className='w-full h-full bg-pink-200 flex items-center justify-center'
        >
          <ContainImage
            src={url}
            alt={meta.file_name}
            width={contain.width}
            height={contain.height}
            priority
          />
        </div>
        {/* サブカラム: 今は空欄 */}
        <div className='flex items-center justify-center h-full bg-amber-300'>
          {/* サブカラム（今は空欄） */}
        </div>
      </div>
    </main>
  );
}
