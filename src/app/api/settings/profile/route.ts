import { NextResponse } from 'next/server';
import { getSettings, updateSection } from '@/lib/settings-store';

/**
 * @swagger
 * /api/settings/profile:
 *   get:
 *     tags:
 *       - Settings
 *     summary: 获取个人资料设置
 *     responses:
 *       200:
 *         description: 成功获取个人资料
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatar:
 *                   type: string
 *                 displayName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 department:
 *                   type: string
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Settings
 *     summary: 更新个人资料设置
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *               displayName:
 *                 type: string
 *               email:
 *                 type: string
 *               department:
 *                 type: string
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
  return NextResponse.json(settings.personal);
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    updateSection('personal', data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update profile settings' }, { status: 500 });
  }
}
