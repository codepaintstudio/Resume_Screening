import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/departments:
 *   get:
 *     tags:
 *       - System
 *     summary: 获取部门列表
 *     description: 获取公司所有部门名称列表
 *     responses:
 *       200:
 *         description: 成功获取部门列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["前端部", "UI部", "运维", "办公室"]
 */
export async function GET() {
  // In a real app, this would be fetched from a database or configuration service
  const departments = ['前端部', 'UI部', '运维', '办公室'];
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return NextResponse.json(departments);
}
