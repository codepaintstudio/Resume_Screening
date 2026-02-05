
import { NextResponse } from 'next/server';
import { getHistory } from '@/data/email-mock';

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
 *                     type: string
 *                   templateName:
 *                     type: string
 *                   subject:
 *                     type: string
 *                   sentAt:
 *                     type: string
 *                   status:
 *                     type: string
 *                   recipientCount:
 *                     type: integer
 */
export async function GET() {
  return NextResponse.json(getHistory());
}
