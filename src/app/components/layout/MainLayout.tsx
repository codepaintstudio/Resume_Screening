'use client';

import React, { Suspense } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function SidebarWrapper() {
  return (
    <Suspense fallback={<div className="w-20 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>}>
      <AppSidebar />
    </Suspense>
  );
}

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
      <div className="hidden md:block h-full">
        <SidebarWrapper />
      </div>
      <div className="flex-1 flex flex-col min-w-0 relative">
        <AppHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
