import { NextResponse } from 'next/server';
import { getDepartmentDistribution } from '@/lib/db/queries';

/**
 * @swagger
 * /api/dashboard/distribution:
 *   get:
 *     tags:
 *       - System
 *     summary: 获取部门投递分布
 *     description: 获取各部门收到的简历数量分布数据，用于饼图展示
 *     responses:
 *       200:
 *         description: 成功获取分布数据
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "前端部"
 *                   value:
 *                     type: integer
 *                     example: 45
 *                   fill:
 *                     type: string
 *                     description: 图表颜色代码
 *                     example: "#2563eb"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function GET() {
  try {
    const data = await getDepartmentDistribution();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching department distribution:', error);
    return NextResponse.json(
      { error: '获取部门分布数据失败' },
      { status: 500 }
    );
  }
}
