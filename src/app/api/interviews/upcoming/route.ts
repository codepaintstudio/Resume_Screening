import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const interviews = [
    { student: '张思锐', time: '14:00 Today', dept: '前端部', type: '初试' },
    { student: '周星', time: '10:00 Tomorrow', dept: 'UI部', type: '复试' },
  ];
  
  return NextResponse.json(interviews);
}
