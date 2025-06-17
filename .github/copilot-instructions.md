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
