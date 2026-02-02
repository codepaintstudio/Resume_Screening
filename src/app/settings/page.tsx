'use client';
import { SettingsPage } from '@/app/components/settings';
import { useAppStore } from '@/store';
export default function Page() {
  const { userRole } = useAppStore();
  return <SettingsPage role={userRole} />;
}
