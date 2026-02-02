'use client';

import React from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { usePathname } from 'next/navigation';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If we are on the login page, render just the children (which is the login page)
  if (pathname === '/login') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
