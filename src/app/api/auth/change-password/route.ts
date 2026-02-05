import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 修改密码
 *     description: 用户修改当前账号的登录密码
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: 当前密码
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: 新密码 (至少6位)
 *     responses:
 *       200:
 *         description: 密码修改成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 参数错误或密码不符合要求
 *       500:
 *         description: 服务器内部错误
 */
export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    // Mock validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: '请输入当前密码和新密码' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: '新密码长度至少需6位' },
        { status: 400 }
      );
    }

    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success
    return NextResponse.json({ 
      success: true, 
      message: '密码修改成功' 
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: '修改密码失败' },
      { status: 500 }
    );
  }
}
