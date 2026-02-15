import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 用户退出登录
 *     description: 清除用户认证 Cookie
 *     responses:
 *       200:
 *         description: 退出成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: '退出成功'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST() {
  try {
    // 清除认证 Cookie
    await clearAuthCookie();

    return NextResponse.json({
      success: true,
      message: '退出成功',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: '退出服务异常' },
      { status: 500 }
    );
  }
}
