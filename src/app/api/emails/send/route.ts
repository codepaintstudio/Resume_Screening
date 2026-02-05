
import { NextResponse } from 'next/server';
import { addHistory, getTemplates } from '@/data/email-mock';
import { addActivity } from '@/data/activity-log';
import { format } from 'date-fns';

/**
 * @swagger
 * /api/emails/send:
 *   post:
 *     tags:
 *       - Emails
 *     summary: 发送邮件
 *     description: 发送面试通知、拒信或其他邮件
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId:
 *                 type: string
 *                 description: 使用的模板 ID
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *               customSubject:
 *                 type: string
 *               customContent:
 *                 type: string
 *               user:
 *                 $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: 邮件发送成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateId, recipients, customSubject, customContent, user } = body;

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
    
    const count = recipientList.length || 0;

    addHistory({
      id: Date.now().toString(),
      templateName: template ? template.name : 'Custom Email',
      subject: customSubject || (template ? template.subject : 'No Subject'),
      content: customContent || (template ? template.content : 'No Content'),
      recipients: recipientList,
      recipientCount: count,
      status: 'success',
      sentAt: format(new Date(), 'yyyy-MM-dd HH:mm')
    });

    // Log Activity
    addActivity({
      user: user?.name || 'Admin',
      action: `发送了 ${count} 封邮件`,
      role: user?.role || '管理员',
      avatar: user?.avatar || ''
    });

    return NextResponse.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to send emails' }, { status: 500 });
  }
}
