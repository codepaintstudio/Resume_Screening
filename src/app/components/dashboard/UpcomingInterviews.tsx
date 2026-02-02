import React from 'react';
import { InterviewItem } from './InterviewItem';

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
          <InterviewItem key={idx} {...interview} />
        ))}
      </div>
    </div>
  );
}
