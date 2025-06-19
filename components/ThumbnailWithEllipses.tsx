import { useEllipses } from '@/hooks/useEllipses';
import type { ImageMeta } from '@/types/imageMeta';
import { PRIMARY_COLOR } from '@/utils/constants';
import Image from 'next/image';
import React from 'react';

interface ThumbnailWithEllipsesProps {
  imageMeta: ImageMeta;
  thumbnailWidth: number;
  thumbnailHeight: number;
}

/**
 * サムネイル画像上に楕円を重ねて表示するコンポーネント（楕円取得も内部で行う）
 */
export const ThumbnailWithEllipses: React.FC<ThumbnailWithEllipsesProps> = ({
  imageMeta,
  thumbnailWidth,
  thumbnailHeight,
}) => {
  const { ellipses } = useEllipses(imageMeta.id);

  // サムネイルエリア内でアスペクト比を保った表示サイズを計算
  const originalWidth = imageMeta.width;
  const originalHeight = imageMeta.height;
  const widthRatio = thumbnailWidth / originalWidth;
  const heightRatio = thumbnailHeight / originalHeight;
  const scale = Math.min(widthRatio, heightRatio);
  const displayedWidth = originalWidth * scale;
  const displayedHeight = originalHeight * scale;

  const width = displayedWidth;
  const height = displayedHeight;

  return (
    <div
      className='relative bg-gray-100 rounded'
      style={{ width: thumbnailWidth, height: thumbnailHeight }}
    >
      <Image
        src={imageMeta.thumbnail_url}
        alt={imageMeta.file_name}
        width={width}
        height={height}
        className='object-contain w-full h-full '
      />
      <svg
        className='absolute inset-0 w-full h-full pointer-events-none'
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {ellipses.map((e) => (
          <ellipse
            key={e.id}
            cx={e.centerX * width}
            cy={e.centerY * height}
            rx={e.rx * width}
            ry={e.ry * height}
            stroke={PRIMARY_COLOR}
            fill='none'
            strokeWidth={2}
          />
        ))}
      </svg>
    </div>
  );
};
