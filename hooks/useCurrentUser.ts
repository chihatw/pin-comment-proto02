import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

/**
 * 現在ログイン中のユーザー情報を取得するカスタムフック
 */
export function useCurrentUser() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!ignore) {
        setUser(data.user ? { id: data.user.id } : null);
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return { user, loading };
}
