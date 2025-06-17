import SignInForm from '../../components/SignInForm';

/**
 * サインインページ
 * @returns JSX.Element
 */
export default function SignInPage() {
  return (
    <main className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md'>
        <h1 className='text-2xl font-bold mb-6 text-center'>Sign In</h1>
        <SignInForm />
      </div>
    </main>
  );
}
