import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db/queries';

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

// 辅助函数：格式化数字（添加千位分隔符）
function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

export async function GET() {
  try {
    const stats = await getDashboardStats();

    const response = [
      {
        label: '收件箱',
        value: formatNumber(stats.totalApplications),
        change: stats.totalChange,
        iconKey: 'FileText',
        color: 'blue',
        trend: stats.totalChange.startsWith('+') ? 'up' : 'down'
      },
      {
        label: '待面试',
        value: formatNumber(stats.pending),
        change: stats.pendingChange,
        iconKey: 'Calendar',
        color: 'amber',
        trend: stats.pendingChange.startsWith('+') ? 'up' : 'down'
      },
      {
        label: '本周通过',
        value: formatNumber(stats.passed),
        change: stats.passedChange,
        iconKey: 'CheckCircle',
        color: 'emerald',
        trend: stats.passedChange.startsWith('+') ? 'up' : 'down'
      },
      {
        label: '面试官',
        value: formatNumber(stats.totalInterviewers),
        change: stats.interviewersChange,
        iconKey: 'Users',
        color: 'violet',
        trend: stats.interviewersChange.startsWith('+') ? 'up' : 'down'
      }
    ];

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
