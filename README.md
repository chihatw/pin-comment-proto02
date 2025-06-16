# pin-comment-proto02

このプロジェクトは Next.js（App Router）+ TypeScript + Tailwind CSS v4 + shadcn/ui + pnpm で構築されています。

## 楕円データの永続化について

- 楕円リスト（ellipses）は、`/repositories/ellipseRepository.ts` のリポジトリ経由で localStorage に永続化されます。
- データ保存は Promise ベースで、将来的な Supabase など外部 DB 移行も容易です。
- 連続した編集操作時は 500ms の debounce（バウンサー）で無駄な保存を抑制します。
- 保存時は呼び出し元ラベル（例: "addEllipse", "updateEllipse", "deleteEllipse" など）を指定し、console.log で出力されます（デバッグ用）。
- 初回マウント時は localStorage から自動で復元されます。

## 開発サーバーの起動

```sh
pnpm dev
```

## ビルド

```sh
pnpm build
```

## プロジェクトの特徴

- Next.js App Router 構成
- TypeScript
- Tailwind CSS v4
- shadcn/ui

## ホームページ

- `/` に「hello, world」と表示されます。

## ContainImage コンポーネント（描画専念型）

`ContainImage` は、**ロジックを持たず描画専念**のコンポーネントです。楕円の状態管理や編集ロジックは親コンポーネントで行い、props で受け渡します。

- 詳細は [`components/ContainImage.md`](./components/ContainImage.md) を参照してください。

### 使い方（useEllipseEditor との組み合わせ例）

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
  setEllipses,
} = useEllipseEditor(width, height, []);

const handleDeleteEllipse = () => {
  if (!selectedId) return;
  setEllipses(
    (prev) => prev.filter((el) => el.id !== selectedId),
    'handleDeleteEllipse'
  );
  setSelectedId(null);
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

## useEllipseEditor フック

- 楕円の描画・編集・選択・移動・リサイズなどのロジックを一括で管理するカスタムフックです。
- 詳細は [`hooks/useEllipseEditor.md`](./hooks/useEllipseEditor.md) を参照してください。

## ユーティリティ関数

### calcContainSize

画面サイズと画像サイズから、アスペクト比を保って最大表示できる幅・高さを計算する関数です。

```ts
import { calcContainSize } from '@/utils/calcContainSize';

const { width, height } = calcContainSize(
  containerWidth,
  containerHeight,
  imageWidth,
  imageHeight
);
```

- containerWidth, containerHeight: 親要素（例: 画面）の幅・高さ（px）
- imageWidth, imageHeight: 画像の幅・高さ（px）
- 戻り値: 最大で収まる幅・高さのオブジェクト

## 共通定数

- `utils/constants.ts` に、楕円のストローク幅などで使う定数 `ELLIPSE_STROKE_WIDTH_RATIO`（0.005, 画像幅の 0.5%）を定義しています。
  - 例: 線の太さやクリック判定の許容範囲など、Viewer/Editor 両方で利用できます。

```ts
// utils/constants.ts
export const ELLIPSE_STROKE_WIDTH_RATIO = 0.005;
```

`ContainImage` などで利用する場合は、

```tsx
import { ELLIPSE_STROKE_WIDTH_RATIO } from '@/utils/constants';
const strokeWidth = width * ELLIPSE_STROKE_WIDTH_RATIO;
```

- 楕円や主要 UI で使うプライマリカラーは `utils/constants.ts` の `PRIMARY_COLOR` で一元管理しています。
  - 例: `import { PRIMARY_COLOR } from '@/utils/constants'`
  - Tailwind CSS で使う場合は `style` 属性や `className` で `PRIMARY_COLOR` を参照してください。
