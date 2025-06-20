// components/ImageWithEllipses.tsx
'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Ellipse } from '../types/ellipse';

interface Props {
  imageUrl: string | null;
  fileName: string;
  ellipses: Ellipse[];
  selectedEllipseIds: string[];
}

/**
 * 画像上にSVGで楕円を重ねて描画するコンポーネント
 */
export function ImageWithEllipses({
  imageUrl,
  fileName,
  ellipses,
  selectedEllipseIds,
}: Props) {
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
    if (img.complete) handleLoad();
    return () => {
      img.removeEventListener('load', handleLoad);
    };
  }, [imageUrl]);

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
    const img = imgRef.current;
    img.addEventListener('load', updateSize);
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => {
      img.removeEventListener('load', updateSize);
      window.removeEventListener('resize', updateSize);
    };
  }, [imageUrl]);

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
