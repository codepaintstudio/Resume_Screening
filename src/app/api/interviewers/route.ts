import { NextResponse } from 'next/server';
import { AVAILABLE_INTERVIEWERS } from '@/config/constants';

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json(AVAILABLE_INTERVIEWERS);
}
