'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/store';
import { Dashboard } from '@/app/components/dashboard';
import { ResumeBank } from '@/app/components/resume-bank';
import { InterviewKanban } from '@/app/components/interview-kanban';
import { EmailSystem } from '@/app/components/email-system';
import { SettingsPage } from '@/app/components/settings';
import { AuthScreen } from '@/app/components/auth-screen';
import { AppSidebar } from '@/app/components/layout/AppSidebar';
import { AppHeader } from '@/app/components/layout/AppHeader';

export default function App() {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    currentPage, 
    userRole,
    theme 
  } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <AuthScreen onLogin={() => setIsLoggedIn(true)} />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'resumes': return <ResumeBank />;
      case 'interviews': return <InterviewKanban />;
      case 'emails': return <EmailSystem />;
      case 'settings': return <SettingsPage role={userRole} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
