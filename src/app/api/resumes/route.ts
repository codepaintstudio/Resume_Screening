import { NextResponse } from 'next/server';
import { mockStudents } from '@/data/mock';
import { addActivity } from '@/data/activity-log';

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return NextResponse.json(mockStudents);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // Handle both direct array (old) and object with user (new)
  let students = [];
  let user = null;

  if (Array.isArray(body)) {
    students = body;
  } else {
    students = body.students;
    user = body.user;
  }

  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Log Activity
  if (students && students.length > 0) {
    addActivity({
      user: user?.name || 'Admin',
      action: `上传了 ${students.length} 份新简历`,
      role: user?.role || '管理员',
      avatar: user?.avatar || ''
    });
  }
  
  // Return the received data with success status
  return NextResponse.json({ success: true, data: students });
}
