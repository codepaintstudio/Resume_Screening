import { NextResponse } from 'next/server';
import { getAiSettings, createOrUpdateAiSettings } from '@/lib/db/queries';

/**
 * @swagger
 * /api/settings/ai:
 *   get:
 *     tags:
 *       - Settings
 *     summary: 获取 AI 设置
 *     responses:
 *       200:
 *         description: 成功获取 AI 设置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vision:
 *                   type: object
 *                   properties:
 *                     endpoint:
 *                       type: string
 *                     model:
 *                       type: string
 *                     apiKey:
 *                       type: string
 *                 llm:
 *                   type: object
 *                   properties:
 *                     baseUrl:
 *                       type: string
 *                     apiKey:
 *                       type: string
 *                     model:
 *                       type: string
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Settings
 *     summary: 更新 AI 设置
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vision:
 *                 type: object
 *               llm:
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
  try {
    const settings = await getAiSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch AI settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    await createOrUpdateAiSettings(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating AI settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to update AI settings' }, { status: 500 });
  }
}
