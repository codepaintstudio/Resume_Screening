'use client';
import { AuthScreen } from '@/app/components/auth-screen';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { setIsLoggedIn, setUserRole, setCurrentUser } = useAppStore();
  const router = useRouter();

  return (
    <AuthScreen onLogin={(user: any) => {
      setIsLoggedIn(true);
      if (user) {
        if (user.role) setUserRole(user.role);
        setCurrentUser(user);
      }
      router.push('/dashboard');
    }} />
  );
}
