
import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings-store';
import { createEmailHistory, getEmailTemplates, createActivityLog } from '@/lib/db/queries';
import { schema } from '@/lib/db';
import { format } from 'date-fns';
import nodemailer from 'nodemailer';

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
    const { host, port, user: smtpUser, pass } = getSettings().emailSending;
    if (!host || !smtpUser || !pass || !port) {
      return NextResponse.json({ success: false, message: 'SMTP configuration incomplete' }, { status: 500 });
    }

    const body = await request.json();
    const { templateId, recipients, customSubject, customContent, user } = body;

    // Get templates from database
    const templates = await getEmailTemplates();
    const template = templates.find(t => t.id === Number(templateId));
    
    // Prepare email content
    const subject = customSubject || (template ? template.subject : 'No Subject');
    const content = customContent || (template ? template.content : 'No Content');
    const templateName = template ? template.name : 'Custom Email';

    // Create nodemailer transporter
    const portNumber = parseInt(port, 10);
    const isSecure = portNumber === 465;
    
    const transporter = nodemailer.createTransport({
      host,
      port: portNumber,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: pass,
      },
      tls: {
        // 对于非 465 端口，建议使用 STARTTLS
        rejectUnauthorized: false,
      }
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP connection failed:', verifyError);
      return NextResponse.json({ success: false, message: 'SMTP connection failed' }, { status: 500 });
    }

    // Process recipients
    const recipientList = Array.isArray(recipients) ? recipients : [];
    const failedRecipients: string[] = [];
    let successCount = 0;

    // Send emails to each recipient
    for (const recipient of recipientList) {
      try {
        // 确保发件人地址格式正确
        const fromName = getSettings().personal.displayName || 'Resume Screening';
        const fromEmail = smtpUser.includes('@') ? smtpUser : `${smtpUser}@${host.replace(/^smtp\./, '')}`;
        
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: recipient.email,
          subject: subject,
          html: content,
        });
        console.log(`Email sent successfully to ${recipient.email}`);
        successCount++;
      } catch (sendError) {
        console.error(`Failed to send email to ${recipient.email}:`, sendError);
        failedRecipients.push(recipient.email);
      }
    }

    // Determine overall status
    const totalCount = recipientList.length;
    const status = failedRecipients.length === 0 ? 'success' : (successCount > 0 ? 'partial' : 'failed');

    // Store email history in database
    await createEmailHistory({
      templateName,
      subject,
      content,
      recipients: recipientList.map((r: any) => ({ 
        name: r.name, 
        email: r.email, 
        status: failedRecipients.includes(r.email) ? 'failed' : 'sent' 
      })),
      recipientCount: successCount,
      status,
      sentAt: new Date()
    });

    // Log activity to database
    await createActivityLog({
      user: user?.name || 'Admin',
      action: `发送了 ${successCount}/${totalCount} 封邮件`,
      role: user?.role || '管理员',
      avatar: user?.avatar || '',
      timestamp: new Date()
    });

    if (failedRecipients.length > 0) {
      return NextResponse.json({ 
        success: status !== 'failed', 
        message: `成功发送 ${successCount}/${totalCount} 封邮件，失败: ${failedRecipients.join(', ')}`,
        failedRecipients
      });
    }

    return NextResponse.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Failed to send emails:', error);
    return NextResponse.json({ success: false, message: 'Failed to send emails' }, { status: 500 });
  }
}
