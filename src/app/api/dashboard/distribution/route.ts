import { NextResponse } from 'next/server';

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
  await new Promise(resolve => setTimeout(resolve, 700));

  const data = [
    { name: '前端部', value: Math.floor(Math.random() * 30) + 20, fill: '#2563eb' },
    { name: 'UI部', value: Math.floor(Math.random() * 30) + 10, fill: '#8b5cf6' },
    { name: '办公室', value: Math.floor(Math.random() * 20) + 5, fill: '#ec4899' },
    { name: '运维', value: Math.floor(Math.random() * 20) + 5, fill: '#f97316' },
  ];

  return NextResponse.json(data);
}
