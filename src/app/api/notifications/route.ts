import { NextResponse } from 'next/server';

// Mock database
let notifications = [
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

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return NextResponse.json(notifications);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, markAll } = body;

    if (markAll) {
      notifications = notifications.map(n => ({ ...n, unread: false }));
    } else if (id) {
      notifications = notifications.map(n => 
        n.id === id ? { ...n, unread: false } : n
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update notifications' }, { status: 500 });
  }
}
