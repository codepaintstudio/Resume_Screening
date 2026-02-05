import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { InterviewItem } from './InterviewItem';
import { Skeleton } from "@/app/components/ui/skeleton";

interface Interview {
  student: string;
  time: string;
  dept: string;
  type: string;
}

export function UpcomingInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reuse existing resumes API and filter for interviewing candidates
    fetch('/api/resumes')
      .then(res => res.json())
      .then((data: any[]) => {
        // Filter students who are in interviewing status
        const upcoming = data
          .filter(s => s.status === 'interviewing')
          .slice(0, 3)
          .map(s => ({
            student: s.name,
            time: '待定', // In a real app, this would be from a scheduled_at field
            dept: s.department,
            type: '技术初试'
          }));
        setInterviews(upcoming);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch interviews:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black tracking-tight">即将进行的面试</h3>
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-[200px] flex items-center justify-center">
        <span className="text-slate-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black tracking-tight">即将进行的面试</h3>
        <Link 
          href="/interviews" 
          className="text-xs text-blue-600 font-black uppercase tracking-wider hover:underline"
        >
          Schedule
        </Link>
      </div>
      <div className="space-y-4">
        {interviews.map((interview, idx) => (
          <InterviewItem key={idx} {...interview} />
        ))}
      </div>
    </div>
  );
}
