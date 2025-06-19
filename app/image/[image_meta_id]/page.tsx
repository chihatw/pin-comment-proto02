'use client';

import { CommentList } from '@/components/CommentList';
import { ContainImage } from '@/components/ContainImage';
import { Button } from '@/components/ui/button';
import { useEllipseEditor } from '@/hooks/useEllipseEditor';
import { imageMetaRepository } from '@/repositories/imageMetaRepository';
import type { ImageMeta } from '@/types/imageMeta';
import { calcContainSize } from '@/utils/calcContainSize';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * /image ページ
 * mocks/imageMeta.ts にある画像をアスペクト比を保って最大表示
 */
export default function ImagePage() {
  const { image_meta_id } = useParams();
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // メインカラムのサイズを取得
  const mainColRef = useRef<HTMLDivElement>(null);
  const [mainColSize, setMainColSize] = useState({ width: 0, height: 0 });

  // metaがnullの場合は0を渡すことでフックの順序を守る
  const contain = calcContainSize(
    mainColSize.width,
    mainColSize.height,
    meta?.width ?? 0,
    meta?.height ?? 0
  );

  // 楕円編集ロジックをページ側で管理
  const {
    ellipses,
    draft,
    selectedId,
    setSelectedId,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onEllipsePointerDown,
    onEllipsePointerMove,
    onEllipsePointerUp,
    svgRef,
    onHandlePointerDown,
    onHandlePointerMove,
    onHandlePointerUp,
    setEllipses,
    updateComment,
    PRIMARY_COLOR,
  } = useEllipseEditor(
    image_meta_id as string,
    contain.width,
    contain.height,
    []
  );

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
  }, [loading]);

  useEffect(() => {
    const fetchMeta = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await imageMetaRepository.fetchById(
          image_meta_id as string
        );
        if (error || !data) {
          setError('画像が見つかりません');
          setMeta(null);
        } else {
          setMeta(data);
        }
      } catch {
        setError('画像の取得に失敗しました');
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };
    if (image_meta_id) fetchMeta();
  }, [image_meta_id]);

  if (loading) return <div>読み込み中...</div>;
  if (error || !meta) return <div>{error || '画像がありません'}</div>;

  // 選択中楕円の削除
  const handleDeleteEllipse = () => {
    if (!selectedId) return;
    setEllipses(
      (prev) => prev.filter((el) => el.id !== selectedId),
      'ImagePage:handleDeleteEllipse'
    );
    setSelectedId(null);
  };

  return (
    <main className='w-screen h-screen overflow-hidden'>
      <div className='grid grid-cols-[minmax(0,1fr)_320px] w-full h-full'>
        {/* メインカラム: 画像と楕円 */}
        <div
          ref={mainColRef}
          className='w-full h-full flex items-center justify-center relative'
        >
          {/* /thumbnails へのリンクボタン */}
          <Link href='/thumbnails' className='absolute left-4 top-4 z-10'>
            <Button type='button' variant='secondary'>
              前往縮圖列表
            </Button>
          </Link>
          <ContainImage
            src={meta.thumbnail_url}
            alt={meta.file_name}
            width={contain.width}
            height={contain.height}
            ellipses={ellipses}
            selectedId={selectedId}
            draft={draft}
            svgRef={svgRef}
            imageMetaId={meta.id}
            setSelectedId={setSelectedId}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onEllipsePointerDown={onEllipsePointerDown}
            onEllipsePointerMove={onEllipsePointerMove}
            onEllipsePointerUp={onEllipsePointerUp}
            onHandlePointerDown={onHandlePointerDown}
            onHandlePointerMove={onHandlePointerMove}
            onHandlePointerUp={onHandlePointerUp}
            onDeleteEllipse={handleDeleteEllipse}
            priority
          />
        </div>
        {/* サブカラム: コメント一覧＋直接編集UI */}
        <div
          className='flex justify-center h-full'
          onClick={() => setSelectedId(null)}
        >
          <div className='w-full max-w-xs bg-white rounded shadow p-4'>
            <h2 className='text-lg font-bold mb-2'>請猜猜對方會問什麼問題</h2>
            <CommentList
              ellipses={ellipses}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              updateComment={updateComment}
              handleDeleteEllipse={handleDeleteEllipse}
              PRIMARY_COLOR={PRIMARY_COLOR}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
