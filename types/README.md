# types ディレクトリについて

このディレクトリは、プロジェクト全体で利用する TypeScript 型定義を管理します。

## 型定義の方針

- `id` は uuid 形式の string 型とする
- 日付プロパティ（created_at, updated_at など）は ISO 8601 形式の string 型とする
- 型ごとにファイルを分割し、必要に応じて JSDoc コメントを記載する

## 追加型一覧

### EllipseComment

- `types/comment.ts` に定義
- 楕円（Ellipse）に紐付くコメント情報を管理
- プロパティ:
  - `id`: コメントの UUID
  - `ellipseId`: 紐付く楕円の UUID
  - `content`: コメント本文
  - `createdAt`, `updatedAt`: ISO 8601 形式の日時

## インポート例

```ts
import { EllipseComment } from '@/types/comment';
```

## その他

- 型定義の追加・修正時は、影響範囲を確認し、必要に応じてドキュメントも更新してください
