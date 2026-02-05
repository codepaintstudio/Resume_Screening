import { NextResponse } from 'next/server';
import { addActivity } from '@/data/activity-log';

export async function POST(request: Request) {
  try {
    const { department, prompt, user } = await request.json();

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Log Activity
    addActivity({
      user: user?.name || 'Admin',
      action: `使用 AI 批量筛选了 [${department === 'all' ? '所有部门' : department}] 的简历`,
      role: user?.role || '管理员',
      avatar: user?.avatar || ''
    });

    // In a real app, this would call an LLM to screen resumes
    // Here we just return success
    return NextResponse.json({
      success: true,
      message: 'Batch screening started successfully',
      data: {
        screenedCount: Math.floor(Math.random() * 10) + 5,
        department,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to start screening' },
      { status: 500 }
    );
  }
}
