// components/ImageWithEllipses.tsx
'use client';
import { calcContainSize } from '@/utils/calcContainSize';
import { ELLIPSE_STROKE_WIDTH_RATIO } from '@/utils/constants';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Ellipse } from '../types/ellipse';

interface Props {
  imageUrl: string | null;
  fileName: string;
  ellipses: Ellipse[];
  selectedEllipseIds: string[];
  width: number;
  height: number;
}

/**
 * 画像上にSVGで楕円を重ねて描画するコンポーネント
 */
export function ImageWithEllipses({
  imageUrl,
  fileName,
  ellipses,
  selectedEllipseIds,
  width,
  height,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  );

  // 最大サイズ（40rem = 640px）
  const MAX_W = 640;
  const MAX_H = 640;

  useEffect(() => {
    if (!width || !height) return;
    const contained = calcContainSize(MAX_W, MAX_H, width, height);
    setSize(contained);
  }, [width, height]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {imageUrl ? (
        <>
          <Image
            ref={imgRef}
            src={imageUrl}
            alt={fileName}
            className='max-w-[40rem] max-h-[40rem] border rounded shadow mb-2'
            style={{ display: 'block' }}
            width={size?.width || 100}
            height={size?.height || 100}
            sizes='(max-width: 640px) 100vw, 40rem'
            priority
          />
          {size && size.width > 0 && size.height > 0 && (
            <svg
              width={size.width}
              height={size.height}
              viewBox={`0 0 ${size.width} ${size.height}`}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              {ellipses.map((e) => (
                <ellipse
                  key={e.id}
                  cx={e.centerX * size.width}
                  cy={e.centerY * size.height}
                  rx={e.rx * size.width}
                  ry={e.ry * size.height}
                  fill='rgba(255,0,0,0)'
                  stroke={selectedEllipseIds.includes(e.id) ? 'red' : 'gray'}
                  strokeWidth={ELLIPSE_STROKE_WIDTH_RATIO * size.width}
                >
                  <title>{e.comment}</title>
                </ellipse>
              ))}
            </svg>
          )}
        </>
      ) : (
        <div className='text-gray-400'>画像URLなし</div>
      )}
    </div>
  );
}
