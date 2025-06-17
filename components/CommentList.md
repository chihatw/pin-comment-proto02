# CommentList コンポーネント

`components/CommentList.tsx` は、楕円に紐付くコメントの一覧表示・編集 UI を提供するコンポーネントです。

## Props

- `comments: EllipseComment[]` — コメント配列
- `ellipses: Ellipse[]` — 楕円配列
- `selectedId: string | null` — 選択中楕円 ID
- `setSelectedId: (id: string | null) => void` — 楕円選択関数
- `updateComment: (ellipseId: string, content: string) => void` — コメント更新関数
- `handleDeleteEllipse: () => void` — 楕円削除関数
- `PRIMARY_COLOR: string` — 選択色

## 機能

- コメントが紐付く楕円のインデックスを表示
- コメント内容の直接編集
- コメントが未入力の場合は「（未入力）」と表示
- 選択中コメントの削除ボタン表示

## 利用例

```tsx
<CommentList
  comments={comments}
  ellipses={ellipses}
  selectedId={selectedId}
  setSelectedId={setSelectedId}
  updateComment={updateComment}
  handleDeleteEllipse={handleDeleteEllipse}
  PRIMARY_COLOR={PRIMARY_COLOR}
/>
```

---

> このコンポーネントは UI 表示に専念し、ロジックは props 経由で受け取る設計です。
