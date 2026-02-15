import { NextResponse } from 'next/server';
import { getCurrentUser, verifyPassword, hashPassword } from '@/lib/auth';
import { getUserById, updateUser } from '@/lib/db/queries';

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 修改密码
 *     description: 用户修改当前账号的登录密码
 *     security:
 *       - bearerAuth: []
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: '密码修改成功'
 *       400:
 *         description: 参数错误或密码不符合要求
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未登录或当前密码错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request: Request) {
  try {
    // 获取当前登录用户
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // 验证必填字段
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: '请输入当前密码和新密码' },
        { status: 400 }
      );
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: '新密码长度至少需6位' },
        { status: 400 }
      );
    }

    // 从数据库获取用户信息
    const users = await getUserById(currentUser.id);
    
    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 400 }
      );
    }

    const user = users[0];

    // 验证当前密码
    const isValidPassword = await verifyPassword(currentPassword, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: '当前密码错误' },
        { status: 401 }
      );
    }

    // 不能使用与当前相同的密码
    const isSameAsOld = await verifyPassword(newPassword, user.password);
    if (isSameAsOld) {
      return NextResponse.json(
        { success: false, message: '新密码不能与当前密码相同' },
        { status: 400 }
      );
    }

    // 哈希新密码并更新到数据库
    const hashedPassword = await hashPassword(newPassword);
    await updateUser(currentUser.id, { password: hashedPassword });

    return NextResponse.json({
      success: true,
      message: '密码修改成功',
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, message: '修改密码失败' },
      { status: 500 }
    );
  }
}
