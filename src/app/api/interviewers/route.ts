import { NextResponse } from 'next/server';
import { AVAILABLE_INTERVIEWERS } from '@/config/constants';

/**
 * @swagger
 * /api/interviewers:
 *   get:
 *     tags:
 *       - Interviews
 *     summary: 获取面试官列表
 *     description: 获取所有可用面试官的列表
 *     responses:
 *       200:
 *         description: 成功获取面试官列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["张三", "李四", "王五"]
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json(AVAILABLE_INTERVIEWERS);
}
