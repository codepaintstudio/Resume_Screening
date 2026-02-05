import { NextResponse } from 'next/server';
import { addActivity } from '@/data/activity-log';

export async function POST(request: Request) {
  const body = await request.json();
  const { candidateIds, time, date, interviewers, user } = body;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Log Activity
  addActivity({
    user: user?.name || 'Admin',
    action: `安排了 ${candidateIds.length} 场面试`,
    role: user?.role || '管理员',
    avatar: user?.avatar || ''
  });

  // In a real app, we would update the database here.
  // For mock, we just return success and the updated fields.
  
  return NextResponse.json({
    success: true,
    message: `成功为 ${candidateIds.length} 位同学安排面试`,
    updatedFields: {
      time,
      date,
      interviewers,
      status: 'pending_interview'
    }
  });
}
