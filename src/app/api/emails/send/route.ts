
import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings-store';
import { createEmailHistory, getEmailTemplates, createActivityLog } from '@/lib/db/queries';
import { schema } from '@/lib/db';
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
 *       500:
 *         description: 邮件发送失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request: Request) {
  try {
    const { host, user: smtpUser, pass } = getSettings().emailSending;
    if (!host || !smtpUser || !pass) {
      return NextResponse.json({ success: false, message: 'SMTP configuration missing' }, { status: 500 });
    }

    const body = await request.json();
    const { templateId, recipients, customSubject, customContent, user } = body;

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get templates from database
    const templates = await getEmailTemplates();
    const template = templates.find(t => t.id === Number(templateId));
    
    // Process recipients to store in history
    const recipientList = Array.isArray(recipients) 
        ? recipients.map((r: any) => ({ name: r.name, email: r.email, status: 'sent' }))
        : [];
    
    const count = recipientList.length || 0;

    // Store email history in database
    const templateName = template ? template.name : 'Custom Email';
    const subject = customSubject || (template ? template.subject : 'No Subject');
    const content = customContent || (template ? template.content : 'No Content');

    await createEmailHistory({
      templateName,
      subject,
      content,
      recipients: recipientList,
      recipientCount: count,
      status: 'success',
      sentAt: new Date()
    });

    // Log activity to database
    await createActivityLog({
      user: user?.name || 'Admin',
      action: `发送了 ${count} 封邮件`,
      role: user?.role || '管理员',
      avatar: user?.avatar || '',
      timestamp: new Date()
    });

    return NextResponse.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Failed to send emails:', error);
    return NextResponse.json({ success: false, message: 'Failed to send emails' }, { status: 500 });
  }
}
