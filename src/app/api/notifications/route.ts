import { NextResponse } from 'next/server';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, createActivityLog } from '@/lib/db/queries';

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: 获取通知列表
 *     description: 获取当前用户的最近通知
 *     responses:
 *       200:
 *         description: 成功获取通知
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Notifications
 *     summary: 标记通知为已读
 *     description: 将指定通知或所有通知标记为已读
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 通知 ID (若 markAll 为 false 则必填)
 *               markAll:
 *                 type: boolean
 *                 description: 是否标记所有通知为已读
 *               user:
 *                 $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: 操作成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: 操作失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    const notifications = await getNumbers(userId ? parseInt(userId, 10) : undefined, limit);
    
    // 格式化返回数据
    const formattedNotifications = notifications.map(n => ({
      id: String(n.id),
      type: n.type,
      title: n.title,
      description: n.description,
      time: n.time || formatTimeAgo(n.timestamp),
      unread: n.unread === '1',
    }));
    
    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json(
      { success: false, message: '获取通知失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, markAll, user } = body;

    if (markAll) {
      const userId = user?.id ? parseInt(user.id, 10) : undefined;
      await markAllNotificationsAsRead(userId);
      
      // Log Activity for Mark All Read
      if (user) {
        await createActivityLog({
          user: user.name || 'User',
          action: '标记所有通知为已读',
          role: user.role || '成员',
          avatar: user.avatar || '',
          userId: user.id ? parseInt(user.id, 10) : undefined
        });
      }
    } else if (id) {
      await markNotificationAsRead(parseInt(id, 10));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update notifications' }, { status: 500 });
  }
}

// 辅助函数：格式化时间为"xx分钟前"
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  return `${Math.floor(diffDays / 30)}个月前`;
}

// 修正函数名
async function getNumbers(userId?: number, limit?: number) {
  return await getNotifications(userId, limit);
}
