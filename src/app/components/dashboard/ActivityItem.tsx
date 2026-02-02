import React from 'react';

export interface ActivityItemProps {
  user: string;
  action: string;
  time: string;
  role: string;
  avatar: string;
}

export function ActivityItem({ user, action, time, role, avatar }: ActivityItemProps) {
  return (
    <div className="flex items-center gap-4">
      <img 
        src={avatar} 
        className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shadow-sm" 
        alt="" 
      />
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {user}
          <span className="text-slate-400 font-medium ml-1"> {action}</span>
        </p>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
          {role} • {time}
        </p>
      </div>
    </div>
  );
}
