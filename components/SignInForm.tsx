'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * サインインフォームコンポーネント
 * @returns JSX.Element
 */
export default function SignInForm() {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await signIn(email, password);
    console.log({ ok });
    if (ok) {
      console.log('サインイン成功');
      router.push('/'); // サインイン成功時はトップへ遷移
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='max-w-sm mx-auto p-4 border rounded space-y-4'
    >
      <div>
        <label htmlFor='email' className='block mb-1'>
          Email
        </label>
        <input
          id='email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full border px-2 py-1 rounded'
          required
        />
      </div>
      <div>
        <label htmlFor='password' className='block mb-1'>
          Password
        </label>
        <input
          id='password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full border px-2 py-1 rounded'
          required
        />
      </div>
      {error && <div className='text-red-500 text-sm'>{error}</div>}
      <button
        type='submit'
        className='w-full bg-slate-500 text-white py-2 rounded disabled:opacity-50'
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
