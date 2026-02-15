import { NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/lib/db/queries';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';

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
 *               name:
 *                 type: string
 *                 description: 用户昵称（可选，默认使用邮箱前缀）
 *               code:
 *                 type: string
 *                 description: 邀请码/验证码（可选）
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
    const { email, password, name, code } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '密码长度不能少于6位' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 验证邀请码（如果有配置的话）
    if (process.env.INVITE_CODE && code !== process.env.INVITE_CODE) {
      return NextResponse.json(
        { success: false, message: '邀请码错误' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUsers = await getUserByEmail(email);
    
    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password);

    // 创建新用户
    const newUser = await createUser({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0], // 默认使用邮箱前缀作为昵称
      role: 'member', // 默认角色
      department: '未分配',
    });

    const createdUser = newUser[0];

    // 生成 JWT Token
    const token = await generateToken({
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
    });

    // 设置认证 Cookie
    await setAuthCookie(token);

    // 返回用户信息（不包含密码）和 token
    return NextResponse.json({
      success: true,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
        avatar: createdUser.avatar,
        department: createdUser.department,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: '注册服务异常' },
      { status: 500 }
    );
  }
}
