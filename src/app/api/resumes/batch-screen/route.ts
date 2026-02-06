import { NextResponse } from 'next/server';
import { addActivity } from '@/data/activity-log';

/**
 * @swagger
 * /api/resumes/batch-screen:
 *   post:
 *     tags:
 *       - Resumes
 *     summary: 批量 AI 筛选
 *     description: 使用 AI 根据设定条件批量筛选简历
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *                 description: 筛选部门
 *               prompt:
 *                 type: string
 *                 description: AI 筛选提示词
 *               user:
 *                 $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: 筛选任务启动成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request: Request) {
  try {
    const { department, prompt, user } = await request.json();

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Log Activity
    addActivity({
      user: user?.name || 'Admin',
      action: `使用 AI 批量筛选了 [${department === 'all' ? '所有部门' : department}] 的简历`,
      role: user?.role || '管理员',
      avatar: user?.avatar || ''
    });

    // In a real app, this would call an LLM to screen resumes
    // Here we just return success
    return NextResponse.json({
      success: true,
      message: 'Batch screening started successfully',
      data: {
        screenedCount: Math.floor(Math.random() * 10) + 5,
        department,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to start screening' },
      { status: 500 }
    );
  }
}
