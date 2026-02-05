export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  time: string;
  timestamp: number;
  role: string;
  avatar: string;
}

let activities: ActivityLog[] = [
  { 
    id: '1', 
    user: 'Admin', 
    action: '解析了 5 份新简历', 
    time: '5分钟前', 
    timestamp: Date.now() - 5 * 60 * 1000,
    role: '前端部', 
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' 
  },
  { 
    id: '2', 
    user: 'LiHua', 
    action: '将 [张晓] 移入一面', 
    time: '1小时前', 
    timestamp: Date.now() - 60 * 60 * 1000,
    role: 'UI部', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' 
  },
  { 
    id: '3', 
    user: 'Lark Bot', 
    action: '发送了 12 条面试提醒', 
    time: '3小时前', 
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    role: '系统', 
    avatar: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100' 
  },
  { 
    id: '4', 
    user: 'Wang', 
    action: '更新了面试题库', 
    time: '5小时前', 
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    role: '后端部', 
    avatar: '' 
  },
  { 
    id: '5', 
    user: 'System', 
    action: '自动归档了 30 份简历', 
    time: '1天前', 
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    role: '系统', 
    avatar: '' 
  },
];

export const getActivities = (page: number = 1, limit: number = 10) => {
  const sorted = activities.sort((a, b) => b.timestamp - a.timestamp);
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: sorted.slice(start, end),
    hasMore: end < sorted.length,
    total: sorted.length
  };
};

export const addActivity = (activity: Omit<ActivityLog, 'id' | 'time' | 'timestamp'>) => {
  const newActivity: ActivityLog = {
    ...activity,
    id: Date.now().toString(),
    time: '刚刚',
    timestamp: Date.now()
  };
  activities.unshift(newActivity);
  // Keep only last 200 activities
  if (activities.length > 200) {
    activities = activities.slice(0, 200);
  }
  return newActivity;
};
