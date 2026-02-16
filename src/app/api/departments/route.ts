import { NextResponse } from 'next/server';
import { getDepartments } from '@/lib/db/queries';

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
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function GET() {
  try {
    const departments = await getDepartments();
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: '获取部门列表失败' },
      { status: 500 }
    );
  }
}
