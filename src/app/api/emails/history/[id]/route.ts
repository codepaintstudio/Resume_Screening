import { NextResponse } from 'next/server';
import { deleteHistory, getHistoryById } from '@/data/email-mock';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const item = getHistoryById(id);
    
    if (!item) {
      return NextResponse.json({ success: false, message: 'History not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    deleteHistory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete history' }, { status: 500 });
  }
}
