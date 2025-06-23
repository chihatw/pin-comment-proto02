'use client';

import { LinkButton } from '@/components/ui/LinkButton';
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
  // チルトシフト用canvas描画
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

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

  // チルトシフト・フィルター描画
  useEffect(() => {
    if (!imageUrl || !imageMeta || !containRect) return;
    let fxCanvas:
      | (HTMLCanvasElement & { draw: (texture: unknown) => unknown })
      | undefined;
    let texture: object | undefined;
    let img: HTMLImageElement | null = null;
    let script: HTMLScriptElement | null = null;
    let cleanup = () => {};
    script = document.createElement('script');
    script.src = '/glfx.js';
    script.onload = () => {
      img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImgLoaded(true);
        if (!img) return;
        try {
          // @ts-expect-error: fx is loaded dynamically from glfx.js
          fxCanvas = window.fx.canvas();
          // @ts-expect-error: fx is loaded dynamically from glfx.js
          texture = fxCanvas.texture(img);
          // adminStateの値を使う（nullならデフォルト値）
          const blur = adminState?.blur ?? 1;
          const gradient = adminState?.gradient ?? 0.75;
          const positionY = adminState?.position_y ?? 0.5;
          const startY = positionY * img.height;
          const endY = positionY * img.height;
          // @ts-expect-error: fx is loaded dynamically from glfx.js
          fxCanvas
            .draw(texture)
            .tiltShift(
              0,
              startY,
              img.width,
              endY,
              blur * 20,
              gradient * img.height
            )
            .update();
        } catch {
          setImgLoaded(false);
          return;
        }
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
            ctx.drawImage(
              fxCanvas as HTMLCanvasElement,
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
          }
        }
      };
      img.src = imageUrl;
    };
    document.body.appendChild(script);
    cleanup = () => {
      if (script) document.body.removeChild(script);
    };
    return cleanup;
  }, [imageUrl, imageMeta, containRect, adminState]);

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
            {/* チルトシフトフィルター済みcanvas */}
            <canvas
              ref={canvasRef}
              width={containRect.width}
              height={containRect.height}
              style={{
                position: 'absolute',
                left: containRect.offsetX,
                top: containRect.offsetY,
                width: containRect.width,
                height: containRect.height,
                zIndex: 1,
                border: 'none',
                background: '#eee',
                display: 'block',
              }}
            />
            {!imgLoaded && (
              <div className='absolute left-0 top-0 w-full h-full flex items-center justify-center bg-white/70 z-10'>
                画像読み込み中...
              </div>
            )}
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
                  zIndex: 2,
                }}
              >
                {ellipses.map((e) => (
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
                    strokeWidth={ELLIPSE_STROKE_WIDTH_RATIO * containRect.width}
                  >
                    <title>{e.comment}</title>
                  </ellipse>
                ))}
              </svg>
            )}
          </>
        ) : (
          <div className='w-full h-full flex items-center justify-center text-gray-400'>
            沒有圖片
          </div>
        )}
      </div>
    </main>
  );
}
