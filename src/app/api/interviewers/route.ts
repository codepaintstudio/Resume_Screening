import { NextResponse } from 'next/server';
import { getInterviewers } from '@/lib/db/queries';

/**
 * @swagger
 * /api/interviewers:
 *   get:
 *     tags:
 *       - Interviews
 *     summary: 获取面试官列表
 *     description: 从数据库获取所有可用面试官的列表（角色为 interviewer 或 member 的用户）
 *     responses:
 *       200:
 *         description: 成功获取面试官列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   department:
 *                     type: string
 *               example: [{"id": 1, "name": "张静", "email": "zhangjing@example.com", "role": "interviewer", "avatar": null, "department": "技术部"}]
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  try {
    const interviewers = await getInterviewers();
    
    // 返回面试官名字数组（兼容原有格式）
    const interviewerNames = interviewers.map(i => i.name);
    
    return NextResponse.json(interviewerNames);
  } catch (error) {
    console.error('Failed to fetch interviewers:', error);
    return NextResponse.json(
      { error: '获取面试官列表失败', details: String(error) },
      { status: 500 }
    );
  }
}
