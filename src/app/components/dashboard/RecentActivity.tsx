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
import { Clock, CheckCircle2, AlertCircle, FileText, UserPlus, Calendar } from 'lucide-react';

export function RecentActivity() {
  const activities = [
    { 
      id: 1,
      user: 'Admin', 
      action: '解析了 5 份新简历', 
      time: '5分钟前', 
      role: '前端部', 
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      type: 'parse',
      detail: '来自 BOSS 直聘的简历导入'
    },
    { 
      id: 2,
      user: 'LiHua', 
      action: '将 [张晓] 移入一面', 
      time: '1小时前', 
      role: 'UI部', 
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      type: 'move',
      detail: '简历评估通过，进入初试阶段'
    },
    { 
      id: 3,
      user: 'Lark Bot', 
      action: '发送了 12 条面试提醒', 
      time: '3小时前', 
      role: '系统', 
      avatar: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100',
      type: 'system',
      detail: '自动发送面试邀请邮件与短信'
    },
  ];

  const allActivities = [
    ...activities,
    { id: 4, user: 'WangWu', action: '更新了面试题库', time: '4小时前', role: '后端部', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100', type: 'update' },
    { id: 5, user: 'Sarah', action: '完成了 [李明] 的初试', time: '5小时前', role: '产品部', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', type: 'complete' },
    { id: 6, user: 'System', action: '自动归档了 3 份简历', time: '6小时前', role: '系统', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', type: 'archive' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'parse': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'move': return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'system': return <AlertCircle className="w-4 h-4 text-purple-500" />;
      case 'update': return <CheckCircle2 className="w-4 h-4 text-orange-500" />;
      case 'complete': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          最新动态
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-xs text-blue-600 font-black uppercase tracking-wider hover:underline">View All</button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>所有动态</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-8 py-2">
                {allActivities.map((activity, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[21px] top-1 w-10 h-10 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
                      {getIcon(activity.type || '')}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{activity.user}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">{activity.role}</span>
                        <span className="text-xs text-slate-400 ml-auto">{activity.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{activity.action}</p>
                      {activity.detail && (
                        <p className="text-xs text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                          {activity.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-8 flex-1 py-2">
        {activities.map((activity, idx) => (
          <div key={idx} className="relative pl-6 group">
            <div className="absolute -left-[21px] top-0 w-10 h-10 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
              <img src={activity.avatar} className="w-full h-full rounded-full object-cover opacity-90" alt="" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-50 dark:border-slate-800">
                 {getIcon(activity.type)}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer transition-colors">{activity.user}</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{activity.role}</span>
                <span className="text-xs text-slate-400 ml-auto font-medium">{activity.time}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {activity.action}
              </p>
              {activity.detail && (
                <div className="mt-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  {activity.detail}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
