import { NextResponse } from 'next/server';
import { deleteStudents, getUserById, createActivityLog } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';

/**
 * @swagger
 * /api/resumes/batch-delete:
 *   post:
 *     tags:
 *       - Resumes
 *     summary: 批量删除简历
 *     description: 批量删除选中的候选人简历
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 要删除的简历 ID 列表
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未登录
 *       500:
 *         description: 服务器内部错误
 */
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: '请选择要删除的简历' },
        { status: 400 }
      );
    }

    // 执行批量删除
    await deleteStudents(ids);

    // 获取当前用户信息用于记录活动日志
    const users = await getUserById(currentUser.id);
    const user = users[0];

    // 记录活动日志
    await createActivityLog({
      user: user?.name || currentUser.name,
      action: `批量删除了 ${ids.length} 份简历`,
      role: user?.role || currentUser.role,
      avatar: user?.avatar || '',
      timestamp: new Date(),
      userId: currentUser.id,
    });

    return NextResponse.json({
      success: true,
      message: `成功删除 ${ids.length} 份简历`,
    });
  } catch (error) {
    console.error('Batch delete resumes error:', error);
    return NextResponse.json(
      { success: false, message: '批量删除失败' },
      { status: 500 }
    );
  }
}
