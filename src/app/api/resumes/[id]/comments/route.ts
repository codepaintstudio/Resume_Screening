import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const comments = [
    {
      id: '1',
      user: 'Admin',
      role: '面试官',
      avatar: 'M',
      content: '该候选人的 GitHub 提交记录非常活跃，建议面试时重点考察项目实践。',
      time: '2小时前'
    },
    {
      id: '2',
      user: 'LiHua',
      role: 'UI组长',
      avatar: 'L',
      content: '作品集很有创意，但是对移动端适配的细节处理还需要确认一下。',
      time: '5小时前'
    },
    {
      id: '3',
      user: 'System',
      role: '系统',
      avatar: 'S',
      content: 'AI 自动评估完成，评分：92分。关键词匹配度高。',
      time: '1天前'
    }
  ];

  // Randomly return 1-3 comments based on ID to make it look dynamic
  const count = (parseInt(id) || 0) % 3 + 1;
  
  return NextResponse.json(comments.slice(0, count));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const { content } = body;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const newComment = {
    id: `new-${Date.now()}`,
    user: 'Me', // In real app, get from session
    role: '面试官',
    avatar: 'M',
    content: content,
    time: '刚刚'
  };

  return NextResponse.json({
    success: true,
    data: newComment
  });
}
