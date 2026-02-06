import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     tags:
 *       - System
 *     summary: 获取仪表盘统计数据
 *     description: 获取首页顶部的关键统计指标（投递量、待处理、通过数等）
 *     responses:
 *       200:
 *         description: 成功获取统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                     example: "总投递量"
 *                   value:
 *                     type: string
 *                     example: "2,543"
 *                   change:
 *                     type: string
 *                     example: "+12.5%"
 *                   iconKey:
 *                     type: string
 *                   color:
 *                     type: string
 *                   trend:
 *                     type: string
 *                     enum: [up, down]
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 800));

  const stats = [
    {
      label: '总投递量',
      value: '2,543',
      change: '+12.5%',
      iconKey: 'FileText',
      color: 'blue',
      trend: 'up'
    },
    {
      label: '待处理',
      value: '45',
      change: '-2.4%',
      iconKey: 'Calendar',
      color: 'amber',
      trend: 'down'
    },
    {
      label: '面试通过',
      value: '128',
      change: '+8.2%',
      iconKey: 'CheckCircle',
      color: 'emerald',
      trend: 'up'
    },
    {
      label: '总面试官',
      value: '24',
      change: '+4.5%',
      iconKey: 'Users',
      color: 'violet',
      trend: 'up'
    }
  ];

  return NextResponse.json(stats);
}
