import { NextResponse } from 'next/server';
import { addUser, checkUserExists } from '@/data/user-mock';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 用户注册
 *     description: 创建新用户账号
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               code:
 *                 type: string
 *                 description: 邀请码/验证码
 *     responses:
 *       200:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 参数错误或邮箱已存在
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, code } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    // Mock code verification
    if (code && code !== '888888') { // Simple mock check
       // For now let's just ignore code or make it optional for demo, or enforce it
    }

    if (checkUserExists(email)) {
      return NextResponse.json(
        { success: false, message: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    const newUser = addUser({
      email,
      password,
      name: email.split('@')[0], // Default name
      role: 'member', // Default role
      department: '未分配'
    });

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '注册服务异常' },
      { status: 500 }
    );
  }
}
