
import { NextResponse } from 'next/server';
import { deleteTemplate, updateTemplate } from '@/data/email-mock';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await request.json();
    const updated = updateTemplate(id, body);
    
    if (updated) {
      return NextResponse.json({ success: true, data: updated });
    } else {
      return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  deleteTemplate(id);
  return NextResponse.json({ success: true });
}
