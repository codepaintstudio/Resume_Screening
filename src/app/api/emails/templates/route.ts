
import { NextResponse } from 'next/server';
import { getTemplates, addTemplate, EmailTemplate } from '@/data/email-mock';

export async function GET() {
  return NextResponse.json(getTemplates());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, subject, content, category } = body;
    
    if (!name || !subject || !content) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name,
      subject,
      content,
      category: category || '通用'
    };

    addTemplate(newTemplate);
    return NextResponse.json({ success: true, data: newTemplate });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create template' }, { status: 500 });
  }
}
