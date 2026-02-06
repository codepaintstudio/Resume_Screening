import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/stats:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: 获取统计数据
 *     description: 获取首页顶部的关键统计指标（简历数、待面试数等）
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
 *                     description: 指标名称
 *                   value:
 *                     type: string
 *                     description: 指标数值
 *                   change:
 *                     type: string
 *                     description: 变化趋势
 *                   iconKey:
 *                     type: string
 *                     description: 图标标识
 *                   color:
 *                     type: string
 *                     description: 颜色主题
 *                   trend:
 *                     type: string
 *                     description: 趋势方向 (up/down)
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 - label: '收件箱简历'
 *                   value: '142'
 *                   change: '+24'
 *                   iconKey: 'FileText'
 *                   color: 'blue'
 *                   trend: 'up'
 */
export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const stats = [
    { label: '收件箱简历', value: '142', change: '+24', iconKey: 'FileText', color: 'blue', trend: 'up' },
    { label: '待面试', value: '12', change: '-2', iconKey: 'Calendar', color: 'purple', trend: 'down' },
    { label: '本周通过', value: '5', change: '+1', iconKey: 'CheckCircle', color: 'emerald', trend: 'up' },
    { label: '当前在线', value: '8', change: 'Live', iconKey: 'Users', color: 'orange', trend: 'up' },
  ];
  
  return NextResponse.json(stats);
}
