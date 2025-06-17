import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Supabase Email/Password認証用カスタムフック
 *
 * @returns { signIn, loading, error }
 */
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Email + パスワードでサインイン
   * @param email
   * @param password
   */
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return false;
    }
    return true;
  };

  return { signIn, loading, error };
}
