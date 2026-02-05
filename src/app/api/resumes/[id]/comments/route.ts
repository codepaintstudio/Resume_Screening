import { NextResponse } from 'next/server';
import { getComments, addComment } from '@/data/comments-mock';
import { addActivity } from '@/data/activity-log';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300)); // Reduced delay for better feel

  const comments = getComments(id);
  
  return NextResponse.json(comments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const body = await request.json();
  const { content, user } = body;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!content) {
    return NextResponse.json({ success: false, message: 'Content is required' }, { status: 400 });
  }

  const newComment = addComment({
    studentId: id,
    user: user?.name || 'Me', // In real app, get from session
    role: user?.role || '面试官',
    avatar: user?.avatar || 'M',
    content: content
  });

  // Log Activity
  addActivity({
    user: user?.name || 'Me',
    action: `评论了候选人 [ID:${id}]`,
    role: user?.role || '面试官',
    avatar: user?.avatar || ''
  });

  return NextResponse.json({
    success: true,
    data: newComment
  });
}
