import { NextResponse } from 'next/server';
import { getTrendData } from '@/lib/db/queries';

/**
 * @swagger
 * /api/dashboard/trend:
 *   get:
 *     tags:
 *       - System
 *     summary: 获取趋势图表数据
 *     description: 获取最近7天的投递量趋势数据
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: 获取天数（默认7天）
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
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '7');

  // 验证参数
  if (days < 1 || days > 30) {
    return NextResponse.json(
      { error: '天数必须在1-30之间' },
      { status: 400 }
    );
  }

  try {
    const data = await getTrendData(days);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching trend data:', error);
    return NextResponse.json(
      { error: '获取趋势数据失败' },
      { status: 500 }
    );
  }
}
