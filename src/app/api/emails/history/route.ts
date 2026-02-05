
import { NextResponse } from 'next/server';
import { getHistory } from '@/data/email-mock';

export async function GET() {
  return NextResponse.json(getHistory());
}
