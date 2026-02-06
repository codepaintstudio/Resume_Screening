import { NextResponse } from 'next/server';
import { getConfig, updateConfig } from '@/data/email-mock';

/**
 * @swagger
 * /api/emails/config:
 *   get:
 *     tags:
 *       - Emails
 *     summary: 获取邮件配置
 *     description: 获取 SMTP 服务器等邮件发送配置
 *     responses:
 *       200:
 *         description: 成功获取配置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 host:
 *                   type: string
 *                 port:
 *                   type: integer
 *                 secure:
 *                   type: boolean
 *                 auth:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                   pass:
 *                       type: string
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags:
 *       - Emails
 *     summary: 更新邮件配置
 *     description: 更新邮件服务器配置信息
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               host:
 *                 type: string
 *               port:
 *                 type: integer
 *               secure:
 *                 type: boolean
 *               auth:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: string
 *                   pass:
 *                     type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  return NextResponse.json(getConfig());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = updateConfig(body);
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update config' }, { status: 500 });
  }
}
