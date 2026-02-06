import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { addComment } from '@/data/comments-mock'; // Import persistence logic

// Extend WebSocket to include custom properties like roomId
interface ExtendedWebSocket extends WebSocket {
  roomId?: string;
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
 *         "candidateId": "stu_123"
 *       }
 *       ```
 *       
 *       2. **发送评论 (SEND_COMMENT)**
 *       ```json
 *       {
 *         "type": "SEND_COMMENT",
 *         "candidateId": "stu_123",
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
 *         "candidateId": "stu_123",
 *         "payload": { ...CommentObject }
 *       }
 *       ```
 *     responses:
 *       101:
 *         description: Switching Protocols (WebSocket Connection Established)
 */
export function SOCKET(
  client: ExtendedWebSocket,
  request: IncomingMessage,
  server: any // WebSocketServer
) {
  // console.log('WS: Client connected');

  client.on('message', (message: Buffer | string) => {
    try {
      const rawMessage = message.toString();
      const data = JSON.parse(rawMessage);

      // Handle Room Joining
      if (data.type === 'JOIN') {
        client.roomId = data.candidateId;
        // console.log(`WS: Client joined room ${data.candidateId}`);
        return;
      }

      // Handle New Comment Submission (Persist & Broadcast)
      if (data.type === 'SEND_COMMENT') {
        const { candidateId, content, user } = data;
        
        // 1. Persist to Mock Database
        const savedComment = addComment({
          studentId: candidateId,
          user: user?.name || 'Anonymous',
          role: user?.role || 'Member',
          avatar: user?.avatar || '',
          content: content
        });

        // 2. Broadcast to ALL clients in the room (including sender)
        const broadcastMessage = JSON.stringify({
          type: 'NEW_COMMENT',
          candidateId: candidateId,
          payload: savedComment
        });

        server.clients.forEach((c: ExtendedWebSocket) => {
          if (
            c.readyState === WebSocket.OPEN && 
            c.roomId === candidateId
          ) {
            c.send(broadcastMessage);
          }
        });
      }
    } catch (e) {
      console.error('WS: Message parsing error', e);
    }
  });

  client.on('close', () => {
    // console.log('WS: Client disconnected');
  });
}
