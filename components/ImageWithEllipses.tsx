// components/ImageWithEllipses.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import type { Ellipse } from '../types/ellipse';

interface Props {
  imageUrl: string | null;
  fileName: string;
  ellipses: Ellipse[];
}

/**
 * 画像上にSVGで楕円を重ねて描画するコンポーネント
 */
export function ImageWithEllipses({ imageUrl, fileName, ellipses }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  );

  useEffect(() => {
    if (!imgRef.current) return;
    const handleLoad = () => {
      if (imgRef.current) {
        setSize({
          width: imgRef.current.naturalWidth,
          height: imgRef.current.naturalHeight,
        });
      }
    };
    const img = imgRef.current;
    img.addEventListener('load', handleLoad);
    // 既に読み込み済みの場合
    if (img.complete) handleLoad();
    return () => {
      img.removeEventListener('load', handleLoad);
    };
  }, [imageUrl]);

  // 画像の表示サイズ（ピクセル）を取得し、SVGも同じサイズで重ねる
  // ただし、imgの表示サイズ（width/height）はCSSで制限されているため、
  // naturalWidth/naturalHeight ではなく、実際の表示サイズ（imgRef.current.width/height）を常に使う
  useEffect(() => {
    if (!imgRef.current) return;
    const updateSize = () => {
      if (imgRef.current) {
        setSize({
          width: imgRef.current.width,
          height: imgRef.current.height,
        });
      }
    };
    // 画像のロード時・リサイズ時に更新
    imgRef.current.addEventListener('load', updateSize);
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => {
      imgRef.current?.removeEventListener('load', updateSize);
      window.removeEventListener('resize', updateSize);
    };
  }, [imageUrl]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {imageUrl ? (
        <>
          <img
            ref={imgRef}
            src={imageUrl}
            alt={fileName}
            className='max-w-[40rem] max-h-[40rem] border rounded shadow mb-2'
            style={{ display: 'block' }}
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
                  stroke='red'
                  strokeWidth={2}
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
