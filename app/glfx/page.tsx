// app/glfx/page.tsx
'use client';
import { useEffect, useRef, useState } from 'react';

const IMAGE_URL =
  'https://ifhrlwhlgpgzpmwdonjo.supabase.co/storage/v1/object/public/pin-comment-images/c049d5c9-66ba-4986-94f3-48c99d893457/82108d37-dccb-45a5-9ccf-9fd293a5d91a.jpg';

export default function GlfxTiltShiftPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blur, setBlur] = useState(1);
  const [gradient, setGradient] = useState(0.5);
  const [positionY, setPositionY] = useState(0.5); // 0-1
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    let fxCanvas:
      | (HTMLCanvasElement & { draw: (texture: unknown) => unknown })
      | null = null;
    let texture: object | null = null;
    let img: HTMLImageElement | null = null;
    let script: HTMLScriptElement | null = null;
    let cleanup = () => {};

    // glfx.js を動的ロード
    script = document.createElement('script');
    script.src = '/glfx.js'; // glfx.js のパスを指定

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
          if (!fxCanvas) return;
          (
            fxCanvas.draw(texture) as {
              tiltShift: (...args: unknown[]) => { update: () => void };
            }
          )
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
            if (!fxCanvas) return;
            ctx.drawImage(
              fxCanvas,
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
          }
        }
      };
      img.src = IMAGE_URL;
    };
    document.body.appendChild(script);
    cleanup = () => {
      if (script) document.body.removeChild(script);
    };
    return cleanup;
  }, [blur, gradient, positionY]);

  return (
    <main className='p-8'>
      <h1 className='text-xl font-bold mb-4'>glfx.js TiltShift サンプル</h1>
      <div className='mb-4'>
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
      <div className='mb-4'>
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
      <div className='flex items-start gap-8'>
        <div className='relative'>
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            style={{ border: '1px solid #ccc', background: '#eee' }}
          />
          {!imgLoaded && (
            <div className='absolute left-0 top-0 w-full h-full flex items-center justify-center bg-white/70'>
              画像読み込み中...
            </div>
          )}
        </div>
        <div className='flex flex-col items-center' style={{ height: 480 }}>
          <label className='mb-2'>Position Y</label>
          <input
            type='range'
            min={0}
            max={1}
            step={0.01}
            value={positionY}
            onChange={(e) => setPositionY(Number(e.target.value))}
            style={{ writingMode: 'vertical-lr', height: 440 }}
            className='slider-vertical'
          />
          <span className='mt-2 text-xs text-gray-500'>{positionY}</span>
        </div>
      </div>
      <p className='mt-4 text-gray-500'>
        glfx.js（CDN）を使ったTiltShiftデモです。パラメータはリアルタイムで反映されます。
      </p>
    </main>
  );
}
