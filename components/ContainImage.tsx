import Image from 'next/image';

export type ContainImageProps = {
  /** 画像のURL */
  src: string;
  /** 画像の代替テキスト */
  alt: string;
  /** 親から渡される幅（px） */
  width: number;
  /** 親から渡される高さ（px） */
  height: number;
  /** オプション: 画像の優先読み込み */
  priority?: boolean;
};

/**
 * 指定された幅・高さ内にobjectFit: 'contain'で画像を収めて表示するコンポーネント
 * @package
 */
export function ContainImage({
  src,
  alt,
  width,
  height,
  priority = false,
}: ContainImageProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'contain' }}
        priority={priority}
        sizes={`${width}px`}
      />
    </div>
  );
}
