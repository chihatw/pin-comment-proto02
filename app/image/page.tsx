import { getMockImageUrl, mockImageMeta } from '@/mocks/imageMeta';
import Image from 'next/image';

/**
 * /image ページ
 * mocks/imageMeta.ts にある画像をアスペクト比を保って最大表示
 * 画像は public/ 配下に配置されていることを前提とする
 */
export default function ImagePage() {
  const meta = mockImageMeta;
  const url = getMockImageUrl();
  if (!meta) return <div>画像がありません</div>;

  return (
    <main className='flex min-h-screen items-center justify-center bg-gray-100'>
      <div className='max-w-full max-h-[80vh] w-auto h-auto flex items-center justify-center'>
        <Image
          src={url}
          alt={meta.file_name}
          width={meta.width}
          height={meta.height}
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            height: 'auto',
            width: 'auto',
            display: 'block',
          }}
          priority
        />
      </div>
    </main>
  );
}
