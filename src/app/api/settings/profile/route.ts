import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById, updateUser } from '@/lib/db/queries';

/**
 * @swagger
 * /api/settings/profile:
 *   get:
 *     tags:
 *       - Settings
 *     summary: 获取当前用户个人资料
 *     description: 获取当前登录用户的个人资料信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取个人资料
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: 用户ID
 *                 email:
 *                   type: string
 *                   description: 用户邮箱
 *                 name:
 *                   type: string
 *                   description: 用户名称
 *                 role:
 *                   type: string
 *                   description: 用户角色
 *                 avatar:
 *                   type: string
 *                   description: 用户头像
 *                 department:
 *                   type: string
 *                   description: 所属部门
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: 创建时间
 *       401:
 *         description: 未登录
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
 *   put:
 *     tags:
 *       - Settings
 *     summary: 更新当前用户个人资料
 *     description: 更新当前登录用户的个人资料信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 用户名称
 *               avatar:
 *                 type: string
 *                 description: 用户头像URL
 *               department:
 *                 type: string
 *                 description: 所属部门
 *     responses:
 *       200:
 *         description: 更新成功
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
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未登录
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
export async function GET() {
  try {
    // 获取当前登录用户
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    // 从数据库获取完整用户信息
    const users = await getUserById(currentUser.id);
    
    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    const user = users[0];

    // 返回用户信息（不包含密码）
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      department: user.department,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: '获取个人资料失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
    const { name, avatar, department } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { success: false, message: '请输入用户名称' },
        { status: 400 }
      );
    }

    // 更新用户信息
    const updateData: { name?: string; avatar?: string; department?: string } = {};
    
    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (department !== undefined) updateData.department = department;

    const updatedUsers = await updateUser(currentUser.id, updateData);
    
    if (!updatedUsers || updatedUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: '更新失败' },
        { status: 400 }
      );
    }

    const updatedUser = updatedUsers[0];

    // 返回更新后的用户信息
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        department: updatedUser.department,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: '更新个人资料失败' },
      { status: 500 }
    );
  }
}
