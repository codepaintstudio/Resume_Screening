import { NextResponse } from 'next/server';
import { getActivities } from '@/data/activity-log';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  await new Promise(resolve => setTimeout(resolve, 500));
  const result = getActivities(page, limit);
  return NextResponse.json(result);
}
