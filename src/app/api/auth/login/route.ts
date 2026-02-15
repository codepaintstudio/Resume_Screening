import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db/queries';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

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
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 认证失败 (邮箱或密码错误)
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
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    // 从数据库查询用户
    const users = await getUserByEmail(email);
    
    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    const user = users[0];

    // 验证密码
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 生成 JWT Token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 设置认证 Cookie
    await setAuthCookie(token);

    // 返回用户信息（不包含密码）和 token
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        department: user.department,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: '登录服务异常' },
      { status: 500 }
    );
  }
}
