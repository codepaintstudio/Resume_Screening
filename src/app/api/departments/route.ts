import { NextResponse } from 'next/server';

export async function GET() {
  // In a real app, this would be fetched from a database or configuration service
  const departments = ['前端部', 'UI部', '运维', '办公室'];
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return NextResponse.json(departments);
}
