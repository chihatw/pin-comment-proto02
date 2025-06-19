'use client';
// /app/signout/page.tsx
// サインアウトページ
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function SignOutPage() {
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    // サインアウト後はmiddlewareで/signinに遷移
    router.refresh();
  }, [router]);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <button
        className='px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 transition'
        onClick={handleSignOut}
      >
        サインアウト
      </button>
    </div>
  );
}
