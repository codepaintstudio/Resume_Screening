import React from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  CheckCircle, 
  ArrowUpRight, 
  ArrowDownRight
} from 'lucide-react';

export function StatsGrid() {
  const stats = [
    { label: '收件箱简历', value: '142', change: '+24', icon: FileText, color: 'blue', trend: 'up' },
    { label: '待面试', value: '12', change: '-2', icon: Calendar, color: 'purple', trend: 'down' },
    { label: '本周通过', value: '5', change: '+1', icon: CheckCircle, color: 'emerald', trend: 'up' },
    { label: '当前在线', value: '8', change: 'Live', icon: Users, color: 'orange', trend: 'up' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
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
      ))}
    </div>
  );
}
