import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 800));

  const stats = [
    {
      label: '总投递量',
      value: '2,543',
      change: '+12.5%',
      iconKey: 'FileText',
      color: 'blue',
      trend: 'up'
    },
    {
      label: '待处理',
      value: '45',
      change: '-2.4%',
      iconKey: 'Calendar',
      color: 'amber',
      trend: 'down'
    },
    {
      label: '面试通过',
      value: '128',
      change: '+8.2%',
      iconKey: 'CheckCircle',
      color: 'emerald',
      trend: 'up'
    },
    {
      label: '总面试官',
      value: '24',
      change: '+4.5%',
      iconKey: 'Users',
      color: 'violet',
      trend: 'up'
    }
  ];

  return NextResponse.json(stats);
}
