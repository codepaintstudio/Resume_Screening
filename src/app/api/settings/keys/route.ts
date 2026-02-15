import { NextResponse } from 'next/server';
import { getApiKeys, replaceApiKeys } from '@/lib/db/queries';

/**
 * @swagger
 * /api/settings/keys:
 *   get:
 *     tags:
 *       - Settings
 *     summary: 获取 API 密钥列表
 *     responses:
 *       200:
 *         description: 成功获取 API 密钥列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   key:
 *                     type: string
 *                   created:
 *                     type: string
 *                   expiresAt:
 *                     type: string
 *                     description: 过期日期 (YYYY-MM-DD)，如果未设置则永久有效
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Settings
 *     summary: 更新 API 密钥列表
 *     description: 替换整个密钥列表
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 key:
 *                   type: string
 *                 created:
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
    const keys = await getApiKeys();
    return NextResponse.json(keys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch API keys' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    await replaceApiKeys(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating API keys:', error);
    return NextResponse.json({ success: false, message: 'Failed to update API keys' }, { status: 500 });
  }
}
