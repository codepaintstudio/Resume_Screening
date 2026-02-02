'use client';
import { AuthScreen } from '@/app/components/auth-screen';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { setIsLoggedIn } = useAppStore();
  const router = useRouter();

  return (
    <AuthScreen onLogin={() => {
      setIsLoggedIn(true);
      router.push('/dashboard');
    }} />
  );
}
