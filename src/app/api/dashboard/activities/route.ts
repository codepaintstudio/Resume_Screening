import { NextResponse } from 'next/server';
import { getActivityLogs } from '@/lib/db/queries';

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
 *                         type: integer
 *                         example: 1
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

// 辅助函数：将时间戳转换为相对时间字符串
function formatRelativeTime(timestamp: Date | string | null): string {
  if (!timestamp) return '';
  
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return time.toLocaleDateString('zh-CN');
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // 验证参数
  if (page < 1) {
    return NextResponse.json(
      { error: '页码必须大于0' },
      { status: 400 }
    );
  }
  if (limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: '每页数量必须在1-100之间' },
      { status: 400 }
    );
  }

  try {
    const result = await getActivityLogs(page, limit);
    
    // 格式化时间字段
    const formattedData = result.data.map(log => ({
      ...log,
      time: log.time || formatRelativeTime(log.timestamp),
      // 确保 id 是数字类型
      id: Number(log.id)
    }));

    return NextResponse.json({
      data: formattedData,
      hasMore: result.hasMore,
      total: result.total
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: '获取活动日志失败' },
      { status: 500 }
    );
  }
}
