
import { NextResponse } from 'next/server';
import { addHistory, getTemplates } from '@/data/email-mock';
import { format } from 'date-fns';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateId, recipients, customSubject, customContent } = body;

    // In a real app, you would fetch recipients and send emails here.
    // We simulate a delay and success.
    await new Promise(resolve => setTimeout(resolve, 1500));

    const templates = getTemplates();
    const template = templates.find(t => t.id === templateId);
    
    // Process recipients to store in history
    // recipients is expected to be an array of objects from the frontend
    const recipientList = Array.isArray(recipients) 
        ? recipients.map((r: any) => ({ name: r.name, email: r.email, status: 'sent' }))
        : [];

    addHistory({
      id: Date.now().toString(),
      templateName: template ? template.name : 'Custom Email',
      subject: customSubject || (template ? template.subject : 'No Subject'),
      content: customContent || (template ? template.content : 'No Content'),
      recipients: recipientList,
      recipientCount: recipientList.length || 0,
      status: 'success',
      sentAt: format(new Date(), 'yyyy-MM-dd HH:mm')
    });

    return NextResponse.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to send emails' }, { status: 500 });
  }
}
