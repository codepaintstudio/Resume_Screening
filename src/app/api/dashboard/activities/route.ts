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
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       user:
 *                         type: string
 *                       action:
 *                         type: string
 *                       time:
 *                         type: string
 *                       role:
 *                         type: string
 *                 hasMore:
 *                   type: boolean
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  await new Promise(resolve => setTimeout(resolve, 500));
  const result = getActivities(page, limit);
  return NextResponse.json(result);
}
