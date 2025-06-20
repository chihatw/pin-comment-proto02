// types/user.ts
/**
 * usersテーブルの型定義
 */
export interface User {
  uid: string; // uuid
  display: string; // ユーザー名
  createdAt: string; // ISO8601
}
