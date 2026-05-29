// repositories/userRepository.ts
import { Database } from '@/types/supabase';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types/user';

export function fromSnakeCaseUser(
  row: Database['public']['Tables']['profiles']['Row'],
): User {
  return {
    userId: row.user_id,
    display: row.display,
    createdAt: row.created_at,
  };
}

export async function fetchAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return data.map(fromSnakeCaseUser);
}
