import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ELLIPSE_STROKE_WIDTH_RATIO, PRIMARY_COLOR } from '@/utils/constants';
import Image from 'next/image';
import { useRef } from 'react';
import type { Ellipse } from '../types/ellipse';
import type { HandleDirection } from '../types/ellipseHandle';

export type ContainImageProps = {
  /** 画像のURL */
  src: string;
  /** 画像の代替テキスト */
  alt: string;
  /** 親から渡される幅（px） */
  width: number;
  /** 親から渡される高さ（px） */
  height: number;
  /** 楕円リスト */
  ellipses: Ellipse[];
  /** 選択中楕円ID */
  selectedId: string | null;
  /** ドラフト楕円（描画中プレビュー） */
  draft?: Ellipse | null;
  /** SVG参照 */
  svgRef: React.RefObject<SVGSVGElement>;
  /** 楕円選択ハンドラ */
  setSelectedId: (id: string | null) => void;
  /** pointerDownハンドラ */
  onPointerDown: (e: React.PointerEvent<SVGSVGElement>) => void;
  /** pointerMoveハンドラ */
  onPointerMove: (e: React.PointerEvent<SVGSVGElement>) => void;
  /** pointerUpハンドラ */
  onPointerUp: () => void;
  /** 楕円クリックハンドラ */
  onEllipsePointerDown: (
    ellipseId: string,
    e: React.PointerEvent<SVGElement>
  ) => void;
  onEllipsePointerMove: (e: React.PointerEvent<SVGSVGElement>) => void;
  onEllipsePointerUp: () => void;
  /** ハンドル操作ハンドラ */
  onHandlePointerDown: (
    ellipseId: string,
    dir: HandleDirection,
    e: React.PointerEvent<SVGCircleElement>
  ) => void;
  onHandlePointerMove: (e: React.PointerEvent<SVGSVGElement>) => void;
  onHandlePointerUp: () => void;
  /** 楕円削除ハンドラ */
  onDeleteEllipse: () => void;
  /** オプション: 画像の優先読み込み */
  priority?: boolean;
};

/**
 * 指定された幅・高さ内にobjectFit: 'contain'で画像を収めて表示し、
 * 楕円リストをSVGで重ねて描画するコンポーネント（描画専念）
 * @package
 */
export function ContainImage({
  src,
  alt,
  width,
  height,
  ellipses,
  selectedId,
  draft,
  svgRef,
  setSelectedId,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onEllipsePointerDown,
  onEllipsePointerMove,
  onEllipsePointerUp,
  onHandlePointerDown,
  onHandlePointerMove,
  onHandlePointerUp,
  onDeleteEllipse,
  priority = false,
}: ContainImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // 線の太さは画像幅の0.5%（例: 400pxなら2px）
  const strokeWidth = width * ELLIPSE_STROKE_WIDTH_RATIO;

  // SVGイベントハンドラの合成
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    onPointerMove(e);
    onEllipsePointerMove(e);
    onHandlePointerMove(e);
  };
  const handlePointerUp = () => {
    onPointerUp();
    onEllipsePointerUp();
    onHandlePointerUp();
  };

  // 削除ボタンの表示
  const deleteButton = renderDeleteButton({
    selectedId,
    ellipses,
    width,
    height,
    handleDeleteEllipse: onDeleteEllipse,
  });

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {deleteButton}
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'contain' }}
        priority={priority}
        sizes={`${width}px`}
      />
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ position: 'absolute', left: 0, top: 0, cursor: 'crosshair' }}
        onPointerDown={(e) => {
          if (e.target === svgRef.current) {
            setSelectedId(null);
          }
          onPointerDown(e);
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {ellipses.map((ellipse) => {
          // 色は常にPRIMARY_COLORを使う
          const color = PRIMARY_COLOR;
          const isSelected = selectedId === ellipse.id;
          return (
            <g key={ellipse.id}>
              <ellipse
                cx={ellipse.centerX * width}
                cy={ellipse.centerY * height}
                rx={ellipse.rx * width}
                ry={ellipse.ry * height}
                fill='rgba(0,0,0,0)'
                stroke={color}
                strokeWidth={strokeWidth}
                style={{ cursor: 'move' }}
                onPointerDown={(e) => onEllipsePointerDown(ellipse.id, e)}
              />
              {/* 楕円の左上に番号を白縁取りで表示 */}
              <text
                x={(ellipse.centerX - ellipse.rx) * width + 6}
                y={(ellipse.centerY - ellipse.ry) * height + 18}
                fontSize={Math.max(14, strokeWidth * 3)}
                stroke='#fff'
                strokeWidth={3}
                fill={color}
                fontWeight='bold'
                pointerEvents='none'
                fontFamily='monospace'
                style={{ userSelect: 'none' }}
              >
                {ellipse.index}
              </text>
              <text
                x={(ellipse.centerX - ellipse.rx) * width + 6}
                y={(ellipse.centerY - ellipse.ry) * height + 18}
                fontSize={Math.max(14, strokeWidth * 3)}
                fill={color}
                fontWeight='bold'
                pointerEvents='none'
                fontFamily='monospace'
                style={{ userSelect: 'none' }}
              >
                {ellipse.index}
              </text>
              {isSelected &&
                renderResizeHandles(
                  ellipse,
                  width,
                  height,
                  strokeWidth,
                  onHandlePointerDown
                )}
            </g>
          );
        })}
        {draft && (
          <ellipse
            cx={draft.centerX * width}
            cy={draft.centerY * height}
            rx={draft.rx * width}
            ry={draft.ry * height}
            fill='none'
            stroke='#e11d48'
            strokeWidth={strokeWidth}
          />
        )}
      </svg>
    </div>
  );
}

/**
 * 楕円のリサイズ用ハンドルを描画する関数
 * @param ellipse 対象の楕円
 * @param width 画像の幅
 * @param height 画像の高さ
 * @param strokeWidth 線の太さ
 * @param onHandlePointerDown ハンドルのPointerDownイベントハンドラ
 */
function renderResizeHandles(
  ellipse: Ellipse,
  width: number,
  height: number,
  strokeWidth: number,
  onHandlePointerDown: (
    ellipseId: string,
    dir: HandleDirection,
    e: React.PointerEvent<SVGCircleElement>
  ) => void
) {
  const cx = ellipse.centerX * width;
  const cy = ellipse.centerY * height;
  const rx = ellipse.rx * width;
  const ry = ellipse.ry * height;
  const handleSize = Math.max(3, strokeWidth * 1.2);
  const handles: {
    dir: HandleDirection;
    x: number;
    y: number;
    cursor: string;
  }[] = [
    { dir: 'topleft', x: cx - rx, y: cy - ry, cursor: 'nwse-resize' },
    { dir: 'topright', x: cx + rx, y: cy - ry, cursor: 'nesw-resize' },
    { dir: 'bottomleft', x: cx - rx, y: cy + ry, cursor: 'nesw-resize' },
    { dir: 'bottomright', x: cx + rx, y: cy + ry, cursor: 'nwse-resize' },
  ];
  return handles.map((h) => (
    <circle
      key={h.dir}
      cx={h.x}
      cy={h.y}
      r={handleSize}
      fill='#fff'
      stroke='#e11d48'
      strokeWidth={1.2}
      style={{ cursor: h.cursor }}
      onPointerDown={(e) => onHandlePointerDown(ellipse.id, h.dir, e)}
    />
  ));
}

/**
 * 選択中楕円の削除ボタンを描画する関数
 * @param params 必要なパラメータ
 * @returns JSX.Element | null
 */
function renderDeleteButton({
  selectedId,
  ellipses,
  width,
  height,
  handleDeleteEllipse,
}: {
  selectedId: string | null;
  ellipses: Ellipse[];
  width: number;
  height: number;
  handleDeleteEllipse: () => void;
}) {
  if (!selectedId) return null;
  const selected = ellipses.find((el) => el.id === selectedId);
  if (!selected) return null;
  // 楕円の右上座標を計算
  const cx = selected.centerX * width;
  const cy = selected.centerY * height;
  const rx = selected.rx * width;
  const ry = selected.ry * height;
  // マジックナンバーの意味: +8pxは右に余白, -32pxは上に浮かせる
  const left = `${cx + rx + 8}px`;
  const top = `${cy - ry - 32}px`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={handleDeleteEllipse}
          style={{
            position: 'absolute',
            left,
            top,
            zIndex: 20,
            background: 'transparent',
            border: 'none',
            color: PRIMARY_COLOR,
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 20,
            boxShadow: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s',
            userSelect: 'none',
          }}
          aria-label='楕円を削除'
        >
          ×
        </button>
      </TooltipTrigger>
      <TooltipContent
        side='top'
        align='center'
        style={{ background: PRIMARY_COLOR, color: '#fff' }}
      >
        削除
      </TooltipContent>
    </Tooltip>
  );
}
