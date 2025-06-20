// repositories/userRepository.ts
import { supabase } from '../lib/supabaseClient';
import { User } from '../types/user';

// Supabaseのusersテーブルの行型
export interface SupabaseUserRow {
  uid: string;
  display: string;
  created_at: string;
}

export function fromSnakeCaseUser(row: SupabaseUserRow): User {
  return {
    uid: row.uid,
    display: row.display,
    createdAt: row.created_at,
  };
}

export async function fetchAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return (data as SupabaseUserRow[]).map(fromSnakeCaseUser);
}
