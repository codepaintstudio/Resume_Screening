import { NextResponse } from 'next/server';
import { getEmailConfig, createOrUpdateEmailConfig } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';

/**
 * @swagger
 * /api/settings/email-sending:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get email sending settings
 *     description: Retrieves the current email sending configuration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email sending settings
 *       401:
 *         description: 未登录
 *   put:
 *     tags:
 *       - Settings
 *     summary: Update email sending settings
 *     description: Updates the email sending configuration
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               host:
 *                 type: string
 *               port:
 *                 type: string
 *               user:
 *                 type: string
 *               pass:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated email sending settings
 *       401:
 *         description: 未登录
 */
export async function GET() {
  try {
    // 验证用户登录状态
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    const config = await getEmailConfig();
    if (!config) {
      // 如果没有配置，返回空值
      return NextResponse.json({
        host: '',
        port: '',
        user: '',
        pass: ''
      });
    }
    return NextResponse.json({
      host: config.host,
      port: config.port,
      user: config.user,
      pass: config.pass
    });
  } catch (error) {
    console.error('Error fetching email config:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // 验证用户登录状态
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    await createOrUpdateEmailConfig({
      host: data.host || '',
      port: data.port || '',
      user: data.user || '',
      pass: data.pass || ''
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating email config:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
