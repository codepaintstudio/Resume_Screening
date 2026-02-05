import React, { useEffect, useState } from 'react';
import { ActivityItem } from './ActivityItem';
import { Skeleton } from "@/app/components/ui/skeleton";
import { ActivityFeedModal } from './ActivityFeedModal';

export function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  useEffect(() => {
    const loadActivities = () => {
      fetch('/api/dashboard/activities?page=1&limit=5')
        .then(res => res.json())
        .then(data => {
          setActivities(data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load activities:', err);
          setLoading(false);
        });
    };

    loadActivities();
    // Poll every 30 seconds
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-[420px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black tracking-tight">最新动态</h3>
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-[420px] flex flex-col">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h3 className="text-lg font-black tracking-tight">最新动态</h3>
          <button 
            onClick={() => setIsViewAllOpen(true)}
            className="text-xs text-blue-600 font-black uppercase tracking-wider hover:underline"
          >
            View All
          </button>
        </div>
        <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {activities.map((activity, idx) => (
            <ActivityItem key={idx} {...activity} />
          ))}
        </div>
      </div>

      <ActivityFeedModal 
        open={isViewAllOpen} 
        onOpenChange={setIsViewAllOpen} 
      />
    </>
  );
}
