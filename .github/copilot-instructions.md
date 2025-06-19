<!--
  Use this file to provide workspace-specific custom instructions to Copilot.
  For more details, visit:
  https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file
-->

# コーディングスタイル

- React のフック（useState, useEffect など）は `import { useState, useEffect } from 'react'` のように個別 import し、`useState()` のように記述してください。`React.useState()` のような記法は使わないでください。

# プロジェクト概要

このプロジェクトは **Next.js + TypeScript + Tailwind CSS v4 + shadcn/ui** を使用しています。

# 基本開発フロー

新しい機能を追加する際は、以下の順序で開発を進めてください。

1. **データ型を決める**
   - TypeScript の型定義（interface/type）を最初に作成し、仕様や要件を明確化します。
2. **モックデータを使って UI を設計する**
   - 作成した型をもとにモックデータを用意し、UI コンポーネントを設計・実装します。
   - UI はモックデータで動作確認できる状態にします。
3. **ロジックを実装する**
   - UI と型が固まった後、ロジックやデータ取得・保存処理を実装します。
   - データアクセスはリポジトリパターンやサービス層を経由し、非同期（Promise ベース）で実装してください。

このフローにより、型・UI・ロジックの分離や、将来的なデータ永続化方式の変更にも柔軟に対応できます。

# 型定義・設計方針

- オブジェクト型を定義する際、
  - `id` プロパティが存在する場合は、uuid 対応可能な文字列型（例: `string` 型で uuid を格納）としてください。
  - 日時プロパティ（例: `createdAt`, `updatedAt` など）は、Supabase での運用を前提とし、ISO 8601 形式の文字列型（例: `string` 型で "2025-06-14T12:34:56.789Z" など）で定義してください。
- 共通の hooks や utils などのディレクトリは `app` ディレクトリ配下ではなく、プロジェクトのルートディレクトリ直下に配置してください。
- コードを新しく追加・変更した場合は、コメント、JSDoc、README.md などのドキュメントも同時に整備してください。
- コンポーネントはなるべく表示機能（UI）に専念させ、ロジックはカスタムフックやユーティリティ関数などに分離してください。

# 将来的なデータ永続化方式の変更について

将来的に localStorage によるデータ永続化から外部データベース（例: Firebase, Supabase など）への移行を予定しています。
そのため、データアクセスは直接 localStorage を操作せず、リポジトリパターンやデータサービス層を経由してください。
また、データ取得・保存は非同期（Promise ベース）で実装してください。

この方針により、永続化方式の変更時も UI やロジックの大幅な修正を避けることができます。

# Supabase SDK の選定方針

- 本プロジェクトでは、Next.js の SSR/Edge/Server Actions との親和性や公式推奨の流れを受け、従来の `@supabase/supabase-js` ではなく `@supabase/ssr` を利用します。
- `@supabase/ssr` はベータ版ですが、今後の主流となる見込みのため、積極的に採用しています。
- サーバー/クライアント間の認証状態の同期や Cookie 管理が容易になるメリットがあります。
- ベータ版のため Breaking Changes などに注意し、公式ドキュメントやリリースノートを随時確認してください。

# データ永続化のワークフロー（localStorage→Supabase 移行時の命名変換）

- 新しいデータ型・リポジトリ実装時は、まず localStorage でテスト・動作確認を行う。
- Supabase など外部 DB に移行する際は、**キャメルケース（TypeScript 型）⇔ スネークケース（DB カラム）変換のユーティリティ関数を必ず用意すること**。
  - 例: `toSnakeCaseEllipse(ellipse: Ellipse): SupabaseEllipseRow` / `fromSnakeCaseEllipse(row: SupabaseEllipseRow): Ellipse`
  - 変換関数はリポジトリ層または `utils/` 配下に実装し、永続化方式ごとに変換処理を共通化する。
- 変換関数を通してデータをやり取りすることで、UI/ロジック層は常にキャメルケース型（TypeScript 型）で統一し、永続化方式の切り替えコストを最小化する。
- 変換関数のテストも必ず用意し、型・値の変換ミスを防ぐ。

# 例

```ts
// キャメルケース→スネークケース
function toSnakeCaseEllipse(e: Ellipse): SupabaseEllipseRow {
  /* ... */
}
// スネークケース→キャメルケース
function fromSnakeCaseEllipse(row: SupabaseEllipseRow): Ellipse {
  /* ... */
}
```

# 備考

- 変換関数の命名・配置場所はプロジェクト全体で統一すること。
- 変換ロジックが複雑な場合は、JSDoc や README で仕様を明記する。

# トランザクション的な一括更新を行うべきケース

- データの「全体が 1 つの状態」として意味を持つ場合（例: 並び順やリスト全体の一貫性が重要な場合）。
- 部分的な追加・削除・更新よりも、「このリストがすべて」という形で一括で入れ替える方が整合性・実装のシンプルさ・バグ防止の観点で優れている場合。
- UI 側でリスト全体を編集・保存する設計になっている場合。
- 順序（index）や重複の不整合を防ぎたい場合。
- データベース側の仕様（例: Supabase の delete()が WHERE 句必須など）や、永続化方式の切り替えを見据えて一括処理が望ましい場合。

> 例: 楕円リスト（Ellipse[]）のように「画像ごとに紐づく全件を一括で保存・入れ替えたい」ケースでは、既存データを全削除 → 新規挿入するトランザクション的な一括更新を採用する。
