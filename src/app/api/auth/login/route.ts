import { NextResponse } from 'next/server';
import { authenticateUser } from '@/data/user-mock';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 用户登录
 *     description: 通过邮箱和密码验证用户身份
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
 *                 description: 用户邮箱
 *                 example: hr@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 用户密码
 *                 example: password123
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: Mock JWT token
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 认证失败
 *       500:
 *         description: 服务器内部错误
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    const user = authenticateUser(email, password);

    if (user) {
      // In a real app, we would set a session cookie here
      return NextResponse.json({
        success: true,
        user,
        token: 'mock-jwt-token-' + user.id // Mock token
      });
    } else {
      return NextResponse.json(
        { success: false, message: '邮箱或密码错误' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '登录服务异常' },
      { status: 500 }
    );
  }
}
