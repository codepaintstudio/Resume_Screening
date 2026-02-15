import { NextResponse } from 'next/server';
import { getResumeImportSettings, createOrUpdateResumeImportSettings } from '@/lib/db/queries';

/**
 * @swagger
 * /api/settings/resume-import:
 *   get:
 *     tags:
 *       - Settings
 *     summary: 获取简历导入设置
 *     responses:
 *       200:
 *         description: 成功获取简历导入设置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imapServer:
 *                   type: string
 *                 port:
 *                   type: string
 *                 account:
 *                   type: string
 *                 password:
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
 *     summary: 更新简历导入设置
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imapServer:
 *                 type: string
 *               port:
 *                 type: string
 *               account:
 *                 type: string
 *               password:
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
  try {
    const settings = await getResumeImportSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching resume import settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch resume import settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    await createOrUpdateResumeImportSettings(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating resume import settings:', error);
    return NextResponse.json({ success: false, message: 'Failed to update resume import settings' }, { status: 500 });
  }
}
