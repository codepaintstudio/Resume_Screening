import { NextResponse } from 'next/server';
import { deleteHistory } from '@/data/email-mock';

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
