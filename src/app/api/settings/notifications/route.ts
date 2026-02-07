import { NextResponse } from 'next/server';
import { getSettings, updateSection } from '@/lib/settings-store';

/**
 * @swagger
 * /api/settings/notifications:
 *   get:
 *     tags:
 *       - Settings
 *     summary: 获取通知设置
 *     responses:
 *       200:
 *         description: 成功获取通知设置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 webhookUrl:
 *                   type: string
 *                 triggers:
 *                   type: object
 *                   properties:
 *                     new_resume:
 *                       type: boolean
 *                     interview_reminder:
 *                       type: boolean
 *                     offer_confirmed:
 *                       type: boolean
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Settings
 *     summary: 更新通知设置
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               webhookUrl:
 *                 type: string
 *               triggers:
 *                 type: object
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  const settings = getSettings();
  return NextResponse.json(settings.notifications);
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    updateSection('notifications', data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update notification settings' }, { status: 500 });
  }
}
