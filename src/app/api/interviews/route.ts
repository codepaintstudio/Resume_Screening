import { NextResponse } from 'next/server';
import { getInterviews } from '@/lib/db/queries';

/**
 * @swagger
 * /api/interviews:
 *   get:
 *     tags:
 *       - Interviews
 *     summary: 获取所有面试列表
 *     description: 获取所有候选人的面试信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: 未登录
 *       500:
 *         description: 服务器内部错误
 */
export async function GET() {
  try {
    const interviews = await getInterviews();
    
    // 返回面试数据
    return NextResponse.json(interviews);
  } catch (error) {
    console.error('Get interviews error:', error);
    return NextResponse.json(
      { success: false, message: '获取面试列表失败' },
      { status: 500 }
    );
  }
}
