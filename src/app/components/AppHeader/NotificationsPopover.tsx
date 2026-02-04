import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Check,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';

type NotificationType = 'interview' | 'resume' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'interview',
    title: '面试提醒',
    description: '待处理面试：前端工程师 - 张三 (14:00)',
    time: '10分钟前',
    unread: true,
  },
  {
    id: '2',
    type: 'resume',
    title: '新简历接收',
    description: '收到 3 份新的高级产品经理简历',
    time: '30分钟前',
    unread: true,
  },
  {
    id: '3',
    type: 'interview',
    title: '面试反馈待填写',
    description: '请填写昨日李四的面试评估报告',
    time: '2小时前',
    unread: true,
  },
  {
    id: '4',
    type: 'system',
    title: '系统更新',
    description: '系统将于今晚 02:00 进行例行维护',
    time: '5小时前',
    unread: true,
  },
  {
    id: '5',
    type: 'resume',
    title: '简历筛选',
    description: '设计部门已完成初步简历筛选',
    time: '1天前',
    unread: true,
  },
  {
    id: '6',
    type: 'resume',
    title: '简历筛选',
    description: '设计部门已完成初步简历筛选',
    time: '1天前',
    unread: false,
  },
  {
    id: '7',
    type: 'resume',
    title: '简历筛选',
    description: '设计部门已完成初步简历筛选',
    time: '1天前',
    unread: false,
  },
  {
    id: '8',
    type: 'system',
    title: '安全警告',
    description: '检测到异地登录尝试，请确认账号安全',
    time: '2天前',
    unread: false,
  },
  {
    id: '9',
    type: 'interview',
    title: '面试安排确认',
    description: '下周一上午10点的面试已确认',
    time: '2天前',
    unread: false,
  },
  {
    id: '10',
    type: 'resume',
    title: '人才库更新',
    description: '本月人才库新增 150 份简历',
    time: '3天前',
    unread: false,
  },
];

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [showAll, setShowAll] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'interview':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'resume':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'system':
        return <MessageSquare className="w-4 h-4 text-orange-500" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'interview':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'resume':
        return 'bg-purple-50 dark:bg-purple-900/20';
      case 'system':
        return 'bg-orange-50 dark:bg-orange-900/20';
    }
  };

  return (
    <>
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 relative hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 outline-none">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 ring-0"></span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="font-semibold text-sm">通知</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto px-2 py-0.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              onClick={markAllAsRead}
            >
              全部已读
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          <div className="flex flex-col">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                暂无通知
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0",
                    notification.unread ? "bg-slate-50/50 dark:bg-slate-800/20" : ""
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={cn("p-2 rounded-full shrink-0", getBgColor(notification.type))}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-medium", notification.unread ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400")}>
                        {notification.title}
                      </p>
                      {notification.unread && (
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {notification.description}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                      <Clock className="w-3 h-3" />
                      {notification.time}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-2 border-t border-slate-100 dark:border-slate-800">
          <Button 
            variant="ghost" 
            className="w-full justify-center text-xs h-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            onClick={() => setShowAll(true)}
          >
            查看全部通知
          </Button>
        </div>
      </PopoverContent>
    </Popover>

    <Dialog open={showAll} onOpenChange={setShowAll}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              通知中心
            </DialogTitle>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs font-bold"
                onClick={markAllAsRead}
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                全部已读
              </Button>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full p-0">
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold">暂无通知</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-4 p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    notification.unread ? "bg-blue-50/30 dark:bg-blue-900/5" : ""
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-full shrink-0 flex items-center justify-center shadow-sm", getBgColor(notification.type))}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className={cn("text-sm font-black", notification.unread ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {notification.description}
                    </p>
                    {notification.unread && (
                      <div className="pt-2">
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          标记为已读
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
</>
  );
}
