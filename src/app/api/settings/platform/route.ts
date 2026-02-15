import { NextResponse } from 'next/server';
import { getPlatformSettings, createOrUpdatePlatformSettings } from '@/lib/db/queries';

/**
 * @swagger
 * /api/settings/platform:
 *   get:
 *     tags:
 *       - Settings
 *     summary: 获取平台设置
 *     responses:
 *       200:
 *         description: 成功获取平台设置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 departments:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Settings
 *     summary: 更新平台设置
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departments:
 *                 type: array
 *                 items:
 *                   type: string
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
  try {
    const settings = await getPlatformSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch platform settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    await createOrUpdatePlatformSettings(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to update platform settings' }, { status: 500 });
  }
}
