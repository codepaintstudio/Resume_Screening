import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const activities = [
    { user: 'Admin', action: '解析了 5 份新简历', time: '5分钟前', role: '前端部', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
    { user: 'LiHua', action: '将 [张晓] 移入一面', time: '1小时前', role: 'UI部', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    { user: 'Lark Bot', action: '发送了 12 条面试提醒', time: '3小时前', role: '系统', avatar: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100' },
    { user: 'Wang', action: '更新了面试题库', time: '5小时前', role: '后端部', avatar: '' },
    { user: 'System', action: '自动归档了 30 份简历', time: '1天前', role: '系统', avatar: '' },
  ];

  return NextResponse.json(activities);
}
