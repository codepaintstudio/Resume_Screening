import { NextResponse } from 'next/server';
import { mockStudents } from '@/data/mock';

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return NextResponse.json(mockStudents);
}

export async function POST(request: Request) {
  const body = await request.json();
  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return the received data with success status
  return NextResponse.json({ success: true, data: body });
}
