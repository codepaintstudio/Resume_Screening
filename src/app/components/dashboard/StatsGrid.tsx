import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  CheckCircle, 
  ArrowUpRight, 
  ArrowDownRight
} from 'lucide-react';
import { Skeleton } from "@/app/components/ui/skeleton";

const ICON_MAP: Record<string, any> = {
  'FileText': FileText,
  'Calendar': Calendar,
  'CheckCircle': CheckCircle,
  'Users': Users
};

interface StatItem {
  label: string;
  value: string;
  change: string;
  iconKey: string;
  color: string;
  trend: 'up' | 'down';
}

export function StatsGrid() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = () => {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load stats:', err);
          setLoading(false);
        });
    };

    loadStats();
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (stats.length === 0) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-[140px]"></div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = ICON_MAP[stat.iconKey] || FileText;
        return (
        <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800`}>
              <Icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {stat.change}
              {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
          </div>
        </div>
      )})}
    </div>
  );
}
