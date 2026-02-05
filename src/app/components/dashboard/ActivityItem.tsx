import React from 'react';

export interface ActivityItemProps {
  user: string;
  action: string;
  time: string;
  role: string;
  avatar: string;
}

export function ActivityItem({ user, action, time, role, avatar }: ActivityItemProps) {
  const isSystem = role === '系统' || user === 'System' || user === 'Lark Bot';
  const displayAvatar = isSystem ? '/logo.png' : avatar;
  
  return (
    <div className="flex items-center gap-4">
      {displayAvatar ? (
        <img 
          src={displayAvatar} 
          className={`w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shadow-sm ${isSystem ? 'bg-white p-1' : ''}`}
          alt={user} 
        />
      ) : (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-sm border border-blue-200">
          {user.substring(0, 2).toUpperCase()}
        </div>
      )}
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
