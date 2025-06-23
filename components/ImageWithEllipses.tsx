// components/ImageWithEllipses.tsx
'use client';
import { updatePinCommentAdminState } from '@/repositories/pinCommentAdminStateRepository';
import { calcContainSize } from '@/utils/calcContainSize';
import { ELLIPSE_STROKE_WIDTH_RATIO } from '@/utils/constants';
import { debounce } from '@/utils/debounce';
import { useEffect, useRef, useState } from 'react';
import type { Ellipse } from '../types/ellipse';

interface Props {
  imageUrl: string | null;
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
  ellipses,
  selectedEllipseIds,
  width,
  height,
}: Props) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  );
  const [blur, setBlurState] = useState(1);
  const [gradient, setGradientState] = useState(0.75);
  const [positionY, setPositionYState] = useState(0.5); // 0-1
  const [imgLoaded, setImgLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 最大サイズ（40rem = 640px）
  const MAX_W = 640;
  const MAX_H = 640;

  useEffect(() => {
    if (!width || !height) return;
    const contained = calcContainSize(MAX_W, MAX_H, width, height);
    setSize(contained);
  }, [width, height]);

  useEffect(() => {
    if (!imageUrl || !size) return;
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
  }, [imageUrl, size, blur, gradient, positionY]);

  // 永続化付きsetBlur
  const setBlur = (v: number) => {
    setBlurState(v);
    updatePinCommentAdminState({ blur: v });
  };

  // 永続化付きsetGradient
  const setGradient = (v: number) => {
    setGradientState(v);
    updatePinCommentAdminState({ gradient: v });
  };

  // 永続化付きsetPositionY（debounce 500ms）
  const debouncedUpdatePositionY = debounce((v: number) => {
    updatePinCommentAdminState({ position_y: v });
  }, 500);

  const setPositionY = (v: number) => {
    setPositionYState(v);
    debouncedUpdatePositionY(v);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {imageUrl && size ? (
        <>
          <div className='flex items-start gap-8'>
            <div className='relative'>
              <canvas
                ref={canvasRef}
                width={size.width}
                height={size.height}
                style={{
                  border: '1px solid #ccc',
                  background: '#eee',
                  display: 'block',
                }}
              />
              {!imgLoaded && (
                <div className='absolute left-0 top-0 w-full h-full flex items-center justify-center bg-white/70'>
                  画像読み込み中...
                </div>
              )}
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
                      stroke={
                        selectedEllipseIds.includes(e.id) ? 'red' : 'gray'
                      }
                      strokeWidth={ELLIPSE_STROKE_WIDTH_RATIO * size.width}
                    >
                      <title>{e.comment}</title>
                    </ellipse>
                  ))}
                </svg>
              )}
            </div>
            <div
              className='flex flex-col items-center'
              style={{ height: size.height, width: '48px' }}
            >
              <input
                type='range'
                min={0}
                max={1}
                step={0.01}
                value={positionY}
                onChange={(e) => setPositionY(Number(e.target.value))}
                style={{
                  writingMode: 'vertical-lr',
                  height: size.height,
                  width: '32px',
                }}
                className='slider-vertical'
              />
              <span
                className='mt-2 text-xs text-gray-500'
                style={{
                  width: '48px',
                  textAlign: 'center',
                  display: 'inline-block',
                }}
              >
                {positionY}
              </span>
            </div>
          </div>
          <div className='flex gap-8 mt-8'>
            <div>
              <label>Blur: {blur}</label>
              <div className='flex items-center gap-4 mt-2'>
                {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                  <label key={v} className='flex items-center gap-1'>
                    <input
                      type='radio'
                      name='blur'
                      value={v}
                      checked={blur === v}
                      onChange={() => setBlur(v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label>Gradient: {gradient}</label>
              <div className='flex items-center gap-4 mt-2'>
                {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                  <label key={v} className='flex items-center gap-1'>
                    <input
                      type='radio'
                      name='gradient'
                      value={v}
                      checked={gradient === v}
                      onChange={() => setGradient(v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className='text-gray-400'>画像URLなし</div>
      )}
    </div>
  );
}
