<!--
  Use this file to provide workspace-specific custom instructions to Copilot.
  For more details, visit:
  https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file
-->

# コーディングスタイル

- React のフック（useState, useEffect など）は `import { useState, useEffect } from 'react'` のように個別 import し、`useState()` のように記述してください。`React.useState()` のような記法は使わないでください。

# プロジェクト概要

このプロジェクトは **Next.js + TypeScript + Tailwind CSS v4 + shadcn/ui** を使用しています。

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
