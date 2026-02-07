import { NextResponse } from 'next/server';
import { getSettings, updateSection } from '@/lib/settings-store';

/**
 * @swagger
 * /api/settings/keys/generate:
 *   post:
 *     tags:
 *       - Settings
 *     summary: 生成新的 API 密钥
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiration:
 *                 type: string
 *                 description: 有效期（天数），'never' 表示永久
 *                 example: "30"
 *     responses:
 *       200:
 *         description: 成功生成密钥
 *         content:
 *           application/json:
 *             schema:
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
 *                 expiresAt:
 *                   type: string
 *       500:
 *         description: 服务器内部错误
 */
export async function POST(request: Request) {
  try {
    const { expiration } = await request.json();
    
    let expiresAt = undefined;
    if (expiration && expiration !== 'never') {
      const days = parseInt(expiration);
      const date = new Date();
      date.setDate(date.getDate() + days);
      expiresAt = date.toISOString().split('T')[0];
    }

    const newKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `sk_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      created: new Date().toISOString().split('T')[0],
      expiresAt
    };

    const settings = getSettings();
    const updatedKeys = [...settings.apiKeys, newKey];
    updateSection('apiKeys', updatedKeys);

    return NextResponse.json(newKey);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}
