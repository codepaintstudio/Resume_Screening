import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/interviews/upcoming:
 *   get:
 *     tags:
 *       - Interviews
 *     summary: 获取近期面试
 *     description: 获取即将开始的面试安排列表
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
 *                   student:
 *                     type: string
 *                     description: 候选人姓名
 *                   time:
 *                     type: string
 *                     description: 面试时间
 *                   dept:
 *                     type: string
 *                     description: 面试部门
 *                   type:
 *                     type: string
 *                     description: 面试类型（初试/复试等）
 *               example:
 *                 - student: "张思锐"
 *                   time: "14:00 Today"
 *                   dept: "前端部"
 *                   type: "初试"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const interviews = [
    { student: '张思锐', time: '14:00 Today', dept: '前端部', type: '初试' },
    { student: '周星', time: '10:00 Tomorrow', dept: 'UI部', type: '复试' },
  ];
  
  return NextResponse.json(interviews);
}
