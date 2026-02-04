import React from 'react';
import { ActivityItem } from './ActivityItem';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

export function RecentActivity() {
  const activities = [
    { user: 'Admin', action: '解析了 5 份新简历', time: '5分钟前', role: '前端部', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    { user: 'LiHua', action: '将 [张晓] 移入一面', time: '1小时前', role: 'UI部', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    { user: 'Lark Bot', action: '发送了 12 条面试提醒', time: '3小时前', role: '系统', avatar: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100' },
  ];

  const allActivities = [
    ...activities,
    { user: 'WangWu', action: '更新了面试题库', time: '4小时前', role: '后端部', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' },
    { user: 'Sarah', action: '完成了 [李明] 的初试', time: '5小时前', role: '产品部', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
    { user: 'System', action: '自动归档了 3 份简历', time: '6小时前', role: '系统', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    { user: 'Admin', action: '修改了系统设置', time: '昨天', role: '管理员', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    { user: 'LiHua', action: '邀请 [王强] 参加复试', time: '昨天', role: 'UI部', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black tracking-tight">最新动态</h3>
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-xs text-blue-600 font-black uppercase tracking-wider hover:underline">View All</button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>所有动态</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-5">
                {allActivities.map((activity, idx) => (
                  <ActivityItem key={idx} {...activity} />
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-5">
        {activities.map((activity, idx) => (
          <ActivityItem key={idx} {...activity} />
        ))}
      </div>
    </div>
  );
}
