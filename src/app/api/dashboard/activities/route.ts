import { NextResponse } from 'next/server';
import { getActivities } from '@/data/activity-log';

/**
 * @swagger
 * /api/dashboard/activities:
 *   get:
 *     tags:
 *       - System
 *     summary: 获取活动日志
 *     description: 分页获取系统的操作日志和动态
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功获取日志
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       user:
 *                         type: string
 *                         example: "Admin"
 *                       action:
 *                         type: string
 *                         example: "解析了 5 份新简历"
 *                       time:
 *                         type: string
 *                         example: "5分钟前"
 *                       role:
 *                         type: string
 *                         example: "前端部"
 *                       avatar:
 *                         type: string
 *                         example: "https://example.com/avatar.jpg"
 *                 hasMore:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   example: 100
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  await new Promise(resolve => setTimeout(resolve, 500));
  const result = getActivities(page, limit);
  return NextResponse.json(result);
}
