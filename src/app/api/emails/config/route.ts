import { NextResponse } from 'next/server';
import { getConfig, updateConfig } from '@/data/email-mock';

export async function GET() {
  return NextResponse.json(getConfig());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = updateConfig(body);
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update config' }, { status: 500 });
  }
}
