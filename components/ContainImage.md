# ContainImage コンポーネント（描画専念型）

## 概要

`ContainImage` は、指定した幅・高さ内に画像を `objectFit: 'contain'` で収め、SVG で楕円リストを重ねて描画する「描画専念」コンポーネントです。

- 楕円の状態管理や編集ロジックは一切持たず、すべて親コンポーネントから props で受け取ります。
- UI（表示）とロジック（状態管理・操作）が分離されているため、保守性・再利用性に優れます。

## Props

| Prop 名                | 型                                                                                           | 説明                           |
| ---------------------- | -------------------------------------------------------------------------------------------- | ------------------------------ |
| `src`                  | `string`                                                                                     | 画像 URL                       |
| `alt`                  | `string`                                                                                     | 画像の代替テキスト             |
| `width`                | `number`                                                                                     | 画像表示幅（px）               |
| `height`               | `number`                                                                                     | 画像表示高さ（px）             |
| `ellipses`             | `Ellipse[]`                                                                                  | 楕円リスト                     |
| `selectedId`           | `string \| null`                                                                             | 選択中楕円 ID                  |
| `draft`                | `Ellipse \| null`                                                                            | 描画中のドラフト楕円（省略可） |
| `svgRef`               | `React.RefObject<SVGSVGElement>`                                                             | SVG 要素への参照               |
| `imageMetaId`          | `string`                                                                                     | 画像メタデータ ID              |
| `setSelectedId`        | `(id: string \| null) => void`                                                               | 楕円選択ハンドラ               |
| `onPointerDown`        | `(e: React.PointerEvent<SVGSVGElement>, imageMetaId: string) => void`                        | SVG pointerDown ハンドラ       |
| `onPointerMove`        | `(e: React.PointerEvent<SVGSVGElement>) => void`                                             | SVG pointerMove ハンドラ       |
| `onPointerUp`          | `() => void`                                                                                 | SVG pointerUp ハンドラ         |
| `onEllipsePointerDown` | `(ellipseId: string, e: React.PointerEvent<SVGElement>) => void`                             | 楕円クリックハンドラ           |
| `onEllipsePointerMove` | `(e: React.PointerEvent<SVGSVGElement>) => void`                                             | 楕円移動中ハンドラ             |
| `onEllipsePointerUp`   | `() => void`                                                                                 | 楕円移動終了ハンドラ           |
| `onHandlePointerDown`  | `(ellipseId: string, dir: HandleDirection, e: React.PointerEvent<SVGCircleElement>) => void` | リサイズハンドル pointerDown   |
| `onHandlePointerMove`  | `(e: React.PointerEvent<SVGSVGElement>) => void`                                             | リサイズハンドル pointerMove   |
| `onHandlePointerUp`    | `() => void`                                                                                 | リサイズハンドル pointerUp     |
| `onDeleteEllipse`      | `() => void`                                                                                 | 選択中楕円の削除ハンドラ       |
| `priority`             | `boolean`                                                                                    | 画像の優先読み込み（省略可）   |

## 使い方例

```tsx
import { ContainImage } from '@/components/ContainImage';
import { useEllipseEditor } from '@/hooks/useEllipseEditor';

const {
  ellipses,
  draft,
  selectedId,
  setSelectedId,
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
} = useEllipseEditor(imageMetaId, width, height, []);

const handleDeleteEllipse = () => {
  // 選択中楕円の削除処理
};

<ContainImage
  src={url}
  alt={alt}
  width={width}
  height={height}
  ellipses={ellipses}
  selectedId={selectedId}
  draft={draft}
  svgRef={svgRef}
  imageMetaId={imageMetaId}
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
/>;
```

## 注意

- 楕円の状態管理・編集ロジックは必ず親コンポーネントで行ってください。
- `useEllipseEditor` などのカスタムフックと組み合わせて使うことを推奨します。
