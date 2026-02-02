import React from 'react';

export function RecentActivity() {
  const activities = [
    { user: 'Admin', action: '解析了 5 份新简历', time: '5分钟前', role: '前端部', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    { user: 'LiHua', action: '将 [张晓] 移入一面', time: '1小时前', role: 'UI部', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    { user: 'Lark Bot', action: '发送了 12 条面试提醒', time: '3小时前', role: '系统', avatar: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black tracking-tight">最新动态</h3>
        <button className="text-xs text-blue-600 font-black uppercase tracking-wider hover:underline">View All</button>
      </div>
      <div className="space-y-5">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <img src={activity.avatar} className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shadow-sm" alt="" />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {activity.user}
                <span className="text-slate-400 font-medium ml-1"> {activity.action}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{activity.role} • {activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
