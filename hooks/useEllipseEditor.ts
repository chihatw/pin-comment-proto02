import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { getEllipses, saveEllipses } from '../repositories/ellipseRepository';

import type { Ellipse } from '../types/ellipse';
import type { HandleDirection } from '../types/ellipseHandle';
import { PRIMARY_COLOR } from '../utils/constants';
import { debounce } from '../utils/debounce';

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
  const [ellipses, setEllipsesState] = useState<Ellipse[]>(initialEllipses);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Ellipse | null>(null); // 描画中のプレビュー楕円
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null) as RefObject<SVGSVGElement>;

  // indexを1始まりで振り直す
  const renumberEllipses = useCallback((list: Ellipse[]): Ellipse[] => {
    return list.map((el, i) => ({ ...el, index: i + 1 }));
  }, []);

  // --- 永続化処理 ---
  // debounce付き保存関数
  const debouncedSave = useRef(
    debounce((ellipses: Ellipse[], caller: string) => {
      saveEllipses(ellipses, caller);
    }, 500)
  ).current;

  // 永続化付きsetEllipses
  const setEllipses = useCallback(
    (updater: (prev: Ellipse[]) => Ellipse[], caller: string) => {
      setEllipsesState((prev) => {
        const next = renumberEllipses(updater(prev));
        debouncedSave(next, caller);
        return next;
      });
    },
    [debouncedSave, renumberEllipses]
  );

  // 初回マウント時にlocalStorageから取得
  useEffect(() => {
    getEllipses().then((loaded) => {
      if (loaded && loaded.length > 0) {
        setEllipsesState(renumberEllipses(loaded));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 楕円の新規描画開始
  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>, imageMetaId: string) => {
      if (e.button !== 0) return; // 左クリックのみ
      const rect = (e.target as SVGSVGElement).getBoundingClientRect();
      const x = (e.clientX - rect.left) / width;
      const y = (e.clientY - rect.top) / height;
      dragStart.current = { x, y };
      setDraft({
        id: 'draft',
        imageMetaId,
        centerX: x,
        centerY: y,
        rx: 0,
        ry: 0,
        index: 0, // ドラフト用の仮index
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comment: '',
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

  // 楕円の新規描画確定
  const onPointerUp = useCallback(() => {
    if (draft && draft.rx > 0.01 && draft.ry > 0.01) {
      const newId = crypto.randomUUID();
      setEllipses(
        (prev) => [
          ...prev,
          {
            ...draft,
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            imageMetaId: draft.imageMetaId,
          },
        ],
        'addEllipse'
      );
    }
    setDraft(null);
    dragStart.current = null;
  }, [draft, setEllipses]);

  // コメント編集
  const updateComment = useCallback(
    (ellipseId: string, content: string) => {
      setEllipses((prev) => {
        const next = prev.map((c) =>
          c.id === ellipseId
            ? { ...c, comment: content, updatedAt: new Date().toISOString() }
            : c
        );
        debouncedSave(next, 'updateComment');
        return next;
      }, 'updateComment');
    },
    [debouncedSave]
  );

  // 楕円の更新時にindexを振り直す
  const setEllipsesWithRenumber = useCallback(
    (updater: (prev: Ellipse[]) => Ellipse[], caller: string) => {
      setEllipses((prev) => {
        const next = renumberEllipses(updater(prev));
        debouncedSave(next, caller);
        return next;
      }, caller);
    },
    [setEllipses, renumberEllipses, debouncedSave]
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
      setEllipsesWithRenumber(
        (prev) =>
          prev.map((el) =>
            el.id === moveTarget
              ? {
                  ...el,
                  centerX: x + moveOffset.current!.x,
                  centerY: y + moveOffset.current!.y,
                  updatedAt: new Date().toISOString(),
                }
              : el
          ),
        'updateEllipse'
      );
    },
    [width, height, moveTarget, setEllipsesWithRenumber]
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
      setEllipsesWithRenumber((prev) => {
        return prev.map((el) => {
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
        });
      }, 'updateEllipse');
    },
    [width, height, setEllipsesWithRenumber]
  );

  // リサイズ終了時の処理
  const onHandlePointerUp = useCallback(() => {
    resizeStart.current = null;
  }, []);

  return {
    ellipses,
    setEllipses: (updater: (prev: Ellipse[]) => Ellipse[], caller: string) =>
      setEllipsesWithRenumber(updater, caller),
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
    updateComment,
    PRIMARY_COLOR,
  };
}
