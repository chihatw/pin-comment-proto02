'use client';

import { LinkButton } from '@/components/ui/LinkButton';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { getImagePublicUrl } from '../../lib/getImagePublicUrl';
import { supabase } from '../../lib/supabaseClient';
import type { PinCommentAdminState } from '../../types/pinCommentAdminState';
import {
  ELLIPSE_STROKE_WIDTH_RATIO,
  PIN_COMMENT_ADMIN_STATE_ID,
  PRIMARY_COLOR,
} from '../../utils/constants';

// pin_comment_image_metas テーブルの型
export type PinCommentImageMeta = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size: number;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  thumbnail_url: string;
};

// pin_comment_ellipses テーブルの型
export type PinCommentEllipse = {
  id: string;
  image_meta_id: string;
  center_x: number;
  center_y: number;
  rx: number;
  ry: number;
  created_at: string;
  updated_at: string;
  index: number;
  comment: string;
};

export default function ViewPage() {
  const [adminState, setAdminState] = useState<PinCommentAdminState | null>(
    null
  );
  const [imageMeta, setImageMeta] = useState<PinCommentImageMeta | null>(null);
  const [ellipses, setEllipses] = useState<PinCommentEllipse[] | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // pin_comment_admin_state の購読＆初回取得
  useEffect(() => {
    supabase
      .from('pin_comment_admin_state')
      .select('*')
      .eq('id', PIN_COMMENT_ADMIN_STATE_ID)
      .single()
      .then(({ data, error }) => {
        // if (error) setError(error.message);
        // else setAdminState(data);
        if (!error) setAdminState(data);
      });

    const channel = supabase
      .channel('pin_comment_admin_state')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pin_comment_admin_state',
          filter: `id=eq.${PIN_COMMENT_ADMIN_STATE_ID}`,
        },
        (payload) => {
          if (payload.new) setAdminState(payload.new as PinCommentAdminState);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // selected_image_meta_id 変更時に image meta, 楕円リスト, 画像URLを取得
  useEffect(() => {
    const metaId = adminState?.selected_image_meta_id;
    if (!metaId) {
      setImageMeta(null);
      setEllipses(null);
      setImageUrl(null);
      return;
    }
    supabase
      .from('pin_comment_image_metas')
      .select('*')
      .eq('id', metaId)
      .single()
      .then(async ({ data, error }) => {
        if (error || !data) {
          setImageMeta(null);
          setImageUrl(null);
        } else {
          setImageMeta(data as PinCommentImageMeta);
          // バケット名は固定（例: 'pin-comment-images'）
          const url = await getImagePublicUrl(
            'pin-comment-images',
            data.storage_path
          );
          setImageUrl(url);
        }
      });
    supabase
      .from('pin_comment_ellipses')
      .select('*')
      .eq('image_meta_id', metaId)
      .order('index', { ascending: true })
      .then(({ data, error }) => {
        if (error || !data) setEllipses(null);
        else setEllipses(data as PinCommentEllipse[]);
      });
  }, [adminState?.selected_image_meta_id, adminState?.selected_ellipse_ids]);

  // 画像のobject-contain表示領域サイズ・オフセットを計算
  function getContainRect(
    containerW: number,
    containerH: number,
    imageW: number,
    imageH: number
  ) {
    const containerRatio = containerW / containerH;
    const imageRatio = imageW / imageH;
    let width, height, offsetX, offsetY;
    if (imageRatio > containerRatio) {
      // 横が余す
      width = containerW;
      height = containerW / imageRatio;
      offsetX = 0;
      offsetY = (containerH - height) / 2;
    } else {
      // 縦が余す
      width = containerH * imageRatio;
      height = containerH;
      offsetX = (containerW - width) / 2;
      offsetY = 0;
    }
    return { width, height, offsetX, offsetY };
  }

  // 親要素サイズを取得
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  let containRect = null;
  if (containerSize && imageMeta) {
    containRect = getContainRect(
      containerSize.width,
      containerSize.height,
      imageMeta.width,
      imageMeta.height
    );
  }

  return (
    <main className='w-screen h-screen overflow-hidden bg-black'>
      <div ref={containerRef} className='w-full h-full relative'>
        {/* /thumbnails へのリンクボタン */}
        <LinkButton
          href='/thumbnails'
          variant='secondary'
          className='absolute left-4 top-4 z-10'
        >
          👉返回首頁
        </LinkButton>
        {imageUrl && containRect ? (
          <>
            <Image
              src={imageUrl}
              alt={imageMeta?.file_name ?? ''}
              className='w-full h-full object-contain select-none pointer-events-none'
              draggable={false}
              style={{ position: 'absolute', left: 0, top: 0 }}
              fill
              sizes='100vw'
              priority
            />
            {ellipses && ellipses.length > 0 && imageMeta && (
              <svg
                width={containRect.width}
                height={containRect.height}
                viewBox={`0 0 ${imageMeta.width} ${imageMeta.height}`}
                style={{
                  position: 'absolute',
                  left: containRect.offsetX,
                  top: containRect.offsetY,
                  width: containRect.width,
                  height: containRect.height,
                  pointerEvents: 'none',
                }}
              >
                {ellipses.map((e) => {
                  // スケール比を計算して線の太さを調整
                  const scaleX = containRect.width / imageMeta.width;
                  const scaleY = containRect.height / imageMeta.height;
                  const avgScale = (scaleX + scaleY) / 2;
                  // viewBox座標系での適切な線幅を計算（表示上8pxになるように）
                  const adjustedStrokeWidth =
                    (containRect.width * ELLIPSE_STROKE_WIDTH_RATIO) / avgScale;

                  return (
                    <ellipse
                      key={e.id}
                      cx={e.center_x * imageMeta.width}
                      cy={e.center_y * imageMeta.height}
                      rx={e.rx * imageMeta.width}
                      ry={e.ry * imageMeta.height}
                      fill='rgba(255,0,0,0)'
                      stroke={
                        adminState?.selected_ellipse_ids?.includes(e.id)
                          ? PRIMARY_COLOR
                          : 'transparent'
                      }
                      strokeWidth={adjustedStrokeWidth}
                    >
                      <title>{e.comment}</title>
                    </ellipse>
                  );
                })}
              </svg>
            )}
          </>
        ) : (
          <div className='w-full h-full flex items-center justify-center text-gray-400'>
            画像がありません
          </div>
        )}
      </div>
    </main>
  );
}
