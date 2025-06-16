import { useCallback, useRef, useState } from 'react';
import type { Ellipse } from '../types/ellipse';
import type { HandleDirection } from '../types/ellipseHandle';

/**
 * 楕円描画・編集用カスタムフック
 * - 楕円の追加（ドラッグで新規作成）
 * - 移動・リサイズ・選択状態の管理
 *
 * @param width 画像の表示幅（px）
 * @param height 画像の表示高さ（px）
 * @param initialEllipses 初期楕円リスト
 */
export function useEllipseEditor(
  width: number,
  height: number,
  initialEllipses: Ellipse[] = []
) {
  const [ellipses, setEllipses] = useState<Ellipse[]>(initialEllipses);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Ellipse | null>(null); // 描画中のプレビュー楕円
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // 楕円の新規描画開始
  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.button !== 0) return; // 左クリックのみ
      const rect = (e.target as SVGSVGElement).getBoundingClientRect();
      const x = (e.clientX - rect.left) / width;
      const y = (e.clientY - rect.top) / height;
      dragStart.current = { x, y };
      setDraft({
        id: 'draft',
        centerX: x,
        centerY: y,
        rx: 0,
        ry: 0,
        index: 0, // ドラフト用の仮index
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    [width, height]
  );

  // 楕円の新規描画中
  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragStart.current) return;
      const rect = (e.target as SVGSVGElement).getBoundingClientRect();
      const x = (e.clientX - rect.left) / width;
      const y = (e.clientY - rect.top) / height;
      const start = dragStart.current;
      // 中心・半径を計算
      const centerX = (start.x + x) / 2;
      const centerY = (start.y + y) / 2;
      const rx = Math.abs(x - start.x) / 2;
      const ry = Math.abs(y - start.y) / 2;
      setDraft((prev) => (prev ? { ...prev, centerX, centerY, rx, ry } : null));
    },
    [width, height]
  );

  // indexを1始まりで振り直す
  const renumberEllipses = useCallback((list: Ellipse[]): Ellipse[] => {
    return list.map((el, i) => ({ ...el, index: i + 1 }));
  }, []);

  // 楕円の新規描画確定
  const onPointerUp = useCallback(() => {
    if (draft && draft.rx > 0.01 && draft.ry > 0.01) {
      setEllipses((prev) =>
        renumberEllipses([
          ...prev,
          {
            ...draft,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
      );
    }
    setDraft(null);
    dragStart.current = null;
  }, [draft, renumberEllipses]);

  // 楕円削除時もindex振り直し
  const setEllipsesWithRenumber = useCallback(
    (updater: (prev: Ellipse[]) => Ellipse[]) => {
      setEllipses((prev) => renumberEllipses(updater(prev)));
    },
    [renumberEllipses]
  );

  // 楕円選択・移動用
  const [moveTarget, setMoveTarget] = useState<string | null>(null);
  const moveOffset = useRef<{ x: number; y: number } | null>(null);

  // 楕円クリックで選択
  const onEllipsePointerDown = useCallback(
    (id: string, e: React.PointerEvent<SVGElement>) => {
      e.stopPropagation();
      if (e.button !== 0) return;
      setSelectedId(id);
      setMoveTarget(id);
      // svg座標系で計算
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width;
      const y = (e.clientY - rect.top) / height;
      const ellipse = ellipses.find((el) => el.id === id);
      if (ellipse) {
        moveOffset.current = { x: ellipse.centerX - x, y: ellipse.centerY - y };
      }
    },
    [width, height, ellipses]
  );

  // 楕円移動中
  const onEllipsePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!moveTarget || !moveOffset.current) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width;
      const y = (e.clientY - rect.top) / height;
      setEllipsesWithRenumber((prev) =>
        prev.map((el) =>
          el.id === moveTarget
            ? {
                ...el,
                centerX: x + moveOffset.current!.x,
                centerY: y + moveOffset.current!.y,
                updatedAt: new Date().toISOString(),
              }
            : el
        )
      );
    },
    [width, height, moveTarget]
  );

  // 楕円移動終了
  const onEllipsePointerUp = useCallback(() => {
    setMoveTarget(null);
    moveOffset.current = null;
  }, []);

  // --- リサイズ用ハンドル ---
  // resizeTarget削除
  // const [resizeTarget, setResizeTarget] = useState<null | { id: string; direction: HandleDirection }>(null);
  const resizeStart = useRef<{
    x: number;
    y: number;
    oppX: number;
    oppY: number;
    id: string;
    direction: HandleDirection;
  } | null>(null);

  // ハンドルmousedown
  const onHandlePointerDown = useCallback(
    (
      id: string,
      direction: HandleDirection,
      e: React.PointerEvent<SVGCircleElement>
    ) => {
      e.stopPropagation();
      if (e.button !== 0) return;
      // setResizeTarget({ id, direction }); // 不要
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width;
      const y = (e.clientY - rect.top) / height;
      const ellipse = ellipses.find((el) => el.id === id);
      if (ellipse) {
        // 対角ハンドルの座標を計算
        let oppX = ellipse.centerX,
          oppY = ellipse.centerY;
        const rx = ellipse.rx,
          ry = ellipse.ry;
        switch (direction) {
          case 'topleft':
            oppX = ellipse.centerX + rx;
            oppY = ellipse.centerY + ry;
            break;
          case 'topright':
            oppX = ellipse.centerX - rx;
            oppY = ellipse.centerY + ry;
            break;
          case 'bottomleft':
            oppX = ellipse.centerX + rx;
            oppY = ellipse.centerY - ry;
            break;
          case 'bottomright':
            oppX = ellipse.centerX - rx;
            oppY = ellipse.centerY - ry;
            break;
        }
        resizeStart.current = { x, y, oppX, oppY, id, direction };
      }
    },
    [width, height, ellipses]
  );

  // ハンドルドラッグ中
  const onHandlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!resizeStart.current) return;
      const { id, direction, oppX, oppY } = resizeStart.current;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width;
      const y = (e.clientY - rect.top) / height;
      setEllipsesWithRenumber((prev) =>
        prev.map((el) => {
          if (el.id !== id) return el;
          // 対角ハンドルを固定し、中心・半径を再計算
          const newCenterX = (x + oppX) / 2;
          const newCenterY = (y + oppY) / 2;
          const newRx = Math.abs(x - oppX) / 2;
          const newRy = Math.abs(y - oppY) / 2;
          return {
            ...el,
            centerX: newCenterX,
            centerY: newCenterY,
            rx: Math.max(0.01, newRx),
            ry: Math.max(0.01, newRy),
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    [width, height]
  );

  // リサイズ終了時の処理
  const onHandlePointerUp = useCallback(() => {
    resizeStart.current = null;
  }, []);

  return {
    ellipses,
    setEllipses: setEllipsesWithRenumber,
    draft,
    selectedId,
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
    svgRef,
    // resizeTarget削除
  };
}
