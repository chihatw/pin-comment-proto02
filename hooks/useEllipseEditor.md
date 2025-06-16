# useEllipseEditor フック

## 概要

`useEllipseEditor` は、画像上の楕円リストの描画・編集・選択・移動・リサイズなどのロジックを一括で管理するカスタムフックです。

- UI（表示）は持たず、状態とイベントハンドラのみを提供します。
- データ永続化はリポジトリパターン経由で行い、将来的な DB 移行も容易です。

## 戻り値

| 返り値名               | 型                                                                                           | 説明                           |
| ---------------------- | -------------------------------------------------------------------------------------------- | ------------------------------ |
| `ellipses`             | `Ellipse[]`                                                                                  | 楕円リスト                     |
| `draft`                | `Ellipse \| null`                                                                            | 描画中のドラフト楕円           |
| `selectedId`           | `string \| null`                                                                             | 選択中楕円 ID                  |
| `setSelectedId`        | `(id: string \| null) => void`                                                               | 楕円選択ハンドラ               |
| `setEllipses`          | `(updater: (prev: Ellipse[]) => Ellipse[], caller?: string) => Promise<void>`                | 楕円リストの更新（永続化付き） |
| `svgRef`               | `React.RefObject<SVGSVGElement>`                                                             | SVG 要素への参照               |
| `onPointerDown`        | `(e: React.PointerEvent<SVGSVGElement>) => void`                                             | SVG pointerDown ハンドラ       |
| `onPointerMove`        | `(e: React.PointerEvent<SVGSVGElement>) => void`                                             | SVG pointerMove ハンドラ       |
| `onPointerUp`          | `() => void`                                                                                 | SVG pointerUp ハンドラ         |
| `onEllipsePointerDown` | `(ellipseId: string, e: React.PointerEvent<SVGElement>) => void`                             | 楕円クリックハンドラ           |
| `onEllipsePointerMove` | `(e: React.PointerEvent<SVGSVGElement>) => void`                                             | 楕円移動中ハンドラ             |
| `onEllipsePointerUp`   | `() => void`                                                                                 | 楕円移動終了ハンドラ           |
| `onHandlePointerDown`  | `(ellipseId: string, dir: HandleDirection, e: React.PointerEvent<SVGCircleElement>) => void` | リサイズハンドル pointerDown   |
| `onHandlePointerMove`  | `(e: React.PointerEvent<SVGSVGElement>) => void`                                             | リサイズハンドル pointerMove   |
| `onHandlePointerUp`    | `() => void`                                                                                 | リサイズハンドル pointerUp     |

## 使い方例

```tsx
import { useEllipseEditor } from '@/hooks/useEllipseEditor';

const {
  ellipses,
  draft,
  selectedId,
  setSelectedId,
  setEllipses,
  svgRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onEllipsePointerDown,
  onEllipsePointerMove,
  onEllipsePointerUp,
  onHandlePointerDown,
  onHandlePointerMove,
  onHandlePointerUp,
} = useEllipseEditor(width, height, initialEllipses);
```

- `ContainImage` などの描画専念コンポーネントと組み合わせて使うことを推奨します。
- データ永続化は `repositories/ellipseRepository.ts` 経由で行われます。
- `setEllipses` の `caller` 引数はデバッグ用ラベルです。

## 注意

- UI ロジックは一切持たず、状態・イベントハンドラのみを提供します。
- 永続化方式の変更にも柔軟に対応できる設計です。
