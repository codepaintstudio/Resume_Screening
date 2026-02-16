import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { createComment, getCommentsByStudentId } from '@/lib/db/queries';

// Extend WebSocket to include custom properties like roomId
interface ExtendedWebSocket extends WebSocket {
  roomId?: string;
  userId?: number;
}

// 全局 WebSocket 服务器实例缓存
declare global {
  var wsServer: any;
}

// Helper function to format relative time
function formatRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
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
    return timestamp.toLocaleDateString('zh-CN');
  }
}

/**
 * @swagger
 * /api/ws:
 *   get:
 *     tags:
 *       - System
 *     summary: WebSocket 实时通信
 *     description: |
 *       建立 WebSocket 连接以支持实时功能（如聊天室）。
 *       
 *       **连接方式**:
 *       `ws://{host}/api/ws`
 *       
 *       **协议定义**:
 *       
 *       1. **加入房间 (JOIN)**
 *       ```json
 *       {
 *         "type": "JOIN",
 *         "candidateId": "1",
 *         "userId": 1
 *       }
 *       ```
 *       
 *       2. **发送评论 (SEND_COMMENT)**
 *       ```json
 *       {
 *         "type": "SEND_COMMENT",
 *         "candidateId": "1",
 *         "content": "这是一条新评论",
 *         "user": {
 *           "name": "张三",
 *           "role": "面试官",
 *           "avatar": "..."
 *         }
 *       }
 *       ```
 *       
 *       3. **新评论广播 (NEW_COMMENT)**
 *       ```json
 *       {
 *         "type": "NEW_COMMENT",
 *         "candidateId": "1",
 *         "payload": { ...CommentObject }
 *       }
 *       ```
 *     responses:
 *       101:
 *         description: Switching Protocols (WebSocket Connection Established)
 */

export async function SOCKET(
  client: ExtendedWebSocket,
  request: IncomingMessage,
  server: any // WebSocketServer
) {
  // console.log('WS: Client connected');

  client.on('message', async (message: Buffer | string) => {
    try {
      const rawMessage = message.toString();
      const data = JSON.parse(rawMessage);

      // Handle Room Joining
      if (data.type === 'JOIN') {
        client.roomId = data.candidateId;
        client.userId = data.userId;
        
        // 缓存该客户端连接到服务器实例
        if (!global.wsServer) {
          global.wsServer = server;
        }
        
        // console.log(`WS: Client joined room ${data.candidateId}`);
        return;
      }

      // Handle New Comment Submission (Persist & Broadcast)
      if (data.type === 'SEND_COMMENT') {
        const { candidateId, content, user } = data;
        
        try {
          // 1. Persist to Database
          const timestamp = new Date();
          const savedComment = await createComment({
            studentId: parseInt(candidateId),
            user: user?.name || 'Anonymous',
            role: user?.role || 'Member',
            avatar: user?.avatar || '',
            content: content,
            timestamp: timestamp,
            userId: data.userId || null,
            time: formatRelativeTime(timestamp)
          });

          // 格式化返回的评论数据
          const commentPayload = {
            id: savedComment[0]?.id || Date.now(),
            studentId: candidateId,
            user: savedComment[0]?.user || user?.name || 'Anonymous',
            role: savedComment[0]?.role || user?.role || 'Member',
            avatar: savedComment[0]?.avatar || user?.avatar || '',
            content: savedComment[0]?.content || content,
            time: savedComment[0]?.time || '刚刚',
            timestamp: timestamp.getTime()
          };

          // 2. Broadcast to ALL clients in the room (including sender)
          const broadcastMessage = JSON.stringify({
            type: 'NEW_COMMENT',
            candidateId: candidateId,
            payload: commentPayload
          });

          // 使用缓存的 server 或传入的 server
          const wsServer = global.wsServer || server;
          if (wsServer && wsServer.clients) {
            wsServer.clients.forEach((c: ExtendedWebSocket) => {
              if (
                c.readyState === WebSocket.OPEN && 
                c.roomId === candidateId
              ) {
                c.send(broadcastMessage);
              }
            });
          }
        } catch (dbError) {
          console.error('WS: Database error:', dbError);
          // 发送错误消息给客户端
          client.send(JSON.stringify({
            type: 'ERROR',
            message: '保存评论失败'
          }));
        }
        return;
      }

      // Handle Get Comments (HISTORY)
      if (data.type === 'GET_COMMENTS') {
        const { candidateId } = data;
        
        try {
          // 从数据库获取评论
          const comments = await getCommentsByStudentId(parseInt(candidateId));
          
          // 格式化评论数据
          const formattedComments = comments.map(c => ({
            id: c.id,
            studentId: c.studentId.toString(),
            user: c.user,
            role: c.role || '',
            avatar: c.avatar || '',
            content: c.content,
            time: c.time || formatRelativeTime(c.timestamp),
            timestamp: new Date(c.timestamp).getTime()
          }));
          
          // 发送历史评论给请求的客户端
          client.send(JSON.stringify({
            type: 'HISTORY',
            candidateId: candidateId,
            payload: formattedComments
          }));
        } catch (dbError) {
          console.error('WS: Get comments error:', dbError);
        }
        return;
      }
    } catch (e) {
      console.error('WS: Message parsing error', e);
    }
  });

  client.on('close', () => {
    // console.log('WS: Client disconnected');
  });
}
