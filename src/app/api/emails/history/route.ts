
import { NextResponse } from 'next/server';
import { getEmailHistory } from '@/lib/db/queries';

/**
 * @swagger
 * /api/emails/history:
 *   get:
 *     tags:
 *       - Emails
 *     summary: 获取发送记录
 *     description: 获取所有邮件发送历史记录
 *     responses:
 *       200:
 *         description: 成功获取记录
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   templateName:
 *                     type: string
 *                   subject:
 *                     type: string
 *                   content:
 *                     type: string
 *                   recipients:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         status:
 *                           type: string
 *                   recipientCount:
 *                     type: integer
 *                   status:
 *                     type: string
 *                     enum: [success, failed, partial]
 *                   sentAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  try {
    const history = await getEmailHistory();
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching email history:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch history' }, { status: 500 });
  }
}
