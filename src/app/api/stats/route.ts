import { NextResponse } from 'next/server';

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const stats = [
    { label: '收件箱简历', value: '142', change: '+24', iconKey: 'FileText', color: 'blue', trend: 'up' },
    { label: '待面试', value: '12', change: '-2', iconKey: 'Calendar', color: 'purple', trend: 'down' },
    { label: '本周通过', value: '5', change: '+1', iconKey: 'CheckCircle', color: 'emerald', trend: 'up' },
    { label: '当前在线', value: '8', change: 'Live', iconKey: 'Users', color: 'orange', trend: 'up' },
  ];
  
  return NextResponse.json(stats);
}
