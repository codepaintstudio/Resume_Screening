import { NextResponse } from 'next/server';
import { getUpcomingInterviews } from '@/lib/db/queries';

/**
 * @swagger
 * /api/interviews/upcoming:
 *   get:
 *     tags:
 *       - Interviews
 *     summary: 获取近期面试
 *     description: 获取即将开始的面试安排列表（已安排但未开始的面试）
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 返回的面试数量限制
 *     responses:
 *       200:
 *         description: 成功获取近期面试列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   studentId:
 *                     type: integer
 *                   name:
 *                     type: string
 *                     description: 候选人姓名
 *                   time:
 *                     type: string
 *                     description: 面试时间
 *                   date:
 *                     type: string
 *                     description: 面试日期
 *                   dept:
 *                     type: string
 *                     description: 面试部门
 *                   interviewers:
 *                     type: array
 *                     items:
 *                       type: string
 *                   stage:
 *                     type: string
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    const interviews = await getUpcomingInterviews(limit);
    
    // 转换为前端需要的格式
    const upcomingInterviews = interviews.map(interview => ({
      id: interview.id,
      studentId: interview.studentId,
      student: interview.name,
      time: interview.time || '',
      date: interview.date ? interview.date.toString() : '',
      dept: interview.department || '',
      department: interview.department || '',
      type: interview.stage === 'interviewing' ? '面试中' : '待面试',
      interviewers: interview.interviewers || [],
      stage: interview.stage,
      location: interview.location || '',
      email: interview.email || '',
      phone: interview.phone || '',
    }));
    
    return NextResponse.json(upcomingInterviews);
  } catch (error) {
    console.error('Failed to fetch upcoming interviews:', error);
    return NextResponse.json(
      { error: '获取近期面试失败', details: String(error) },
      { status: 500 }
    );
  }
}
