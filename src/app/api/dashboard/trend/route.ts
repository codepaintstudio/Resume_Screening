import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/dashboard/trend:
 *   get:
 *     tags:
 *       - System
 *     summary: 获取趋势图表数据
 *     description: 获取最近7天的投递量趋势数据
 *     responses:
 *       200:
 *         description: 成功获取趋势数据
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "01-26"
 *                   value:
 *                     type: integer
 *                     example: 42
 */
export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 600));

  const data = [
    { name: '01-26', value: Math.floor(Math.random() * 50) + 10 },
    { name: '01-27', value: Math.floor(Math.random() * 50) + 10 },
    { name: '01-28', value: Math.floor(Math.random() * 50) + 10 },
    { name: '01-29', value: Math.floor(Math.random() * 50) + 10 },
    { name: '01-30', value: Math.floor(Math.random() * 50) + 10 },
    { name: '01-31', value: Math.floor(Math.random() * 50) + 10 },
    { name: '02-01', value: Math.floor(Math.random() * 50) + 10 },
  ];

  return NextResponse.json(data);
}
