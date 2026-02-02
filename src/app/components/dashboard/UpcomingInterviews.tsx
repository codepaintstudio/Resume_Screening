import React from 'react';
import { Send } from 'lucide-react';

export function UpcomingInterviews() {
  const interviews = [
    { student: '张思锐', time: '14:00 Today', dept: '前端部', type: '初试' },
    { student: '周星', time: '10:00 Tomorrow', dept: 'UI部', type: '复试' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black tracking-tight">即将进行的面试</h3>
        <button className="text-xs text-blue-600 font-black uppercase tracking-wider hover:underline">Schedule</button>
      </div>
      <div className="space-y-4">
        {interviews.map((interview, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:border-blue-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[10px] font-black text-blue-600 uppercase">Feb</span>
              <span className="text-lg font-black leading-none mt-1">02</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black">{interview.student}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{interview.dept} • {interview.type}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-900 dark:text-white">{interview.time}</p>
              <button className="mt-2 p-1.5 bg-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
