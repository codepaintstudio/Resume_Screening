import { ImapFlow } from 'imapflow';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/get-inbox:
 *   post:
 *     tags:
 *       - Email
 *     summary: 获取邮箱收件箱
 *     description: 通过 IMAP 协议连接邮箱服务器获取收件箱邮件
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               host:
 *                 type: string
 *                 description: 邮箱服务器地址
 *               port:
 *                 type: number
 *                 description: 端口号（默认993）
 *               user:
 *                 type: string
 *                 description: 邮箱账号
 *               pass:
 *                 type: string
 *                 description: 邮箱授权码
 *               limit:
 *                 type: number
 *                 description: 获取邮件数量（默认20）
 *     responses:
 *       200:
 *         description: 成功获取收件箱
 *       401:
 *         description: 未登录
 *       500:
 *         description: 服务器错误
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { host, port = 993, user, pass, limit = 20 } = body;

    // 验证必要参数
    if (!host || !user || !pass) {
      return NextResponse.json(
        { success: false, message: '请提供完整的邮箱配置（host, user, pass）' },
        { status: 400 }
      );
    }

    const client = new ImapFlow({
      host,
      port: Number(port),
      secure: true,
      auth: {
        user,
        pass,
      },
    });

    try {
      // 1. 连接邮箱
      await client.connect();

      // 2. 打开收件箱
      const mailbox = await client.mailboxOpen('INBOX');

      // 3. 获取最新邮件
      // 先获取总数，然后从最新开始取
      const totalMessages = mailbox.exists;
      const rangeStart = Math.max(1, totalMessages - limit + 1);
      
      // 一次性获取所有邮件的 envelope 和 source
      const mails = await client.fetch(`${rangeStart}:*`, {
        envelope: true,
        uid: true,
        source: true,
      });

      const result = [];
      
      for await (const mail of mails) {
        let bodyText = '';
        
        // 调试：打印 mail 对象的结构
        console.log('Mail keys:', Object.keys(mail || {}));
        console.log('Has source:', !!mail.source);
        if (mail.source) {
          console.log('Source type:', typeof mail.source);
          console.log('Source keys:', mail.source && typeof mail.source === 'object' ? Object.keys(mail.source) : 'N/A');
        }
        
        // 同时返回调试信息
        const debugInfo = {
          hasSource: !!mail.source,
          sourceType: mail.source ? typeof mail.source : null,
        };
        
        // 解析邮件源码获取正文
        if (mail.source) {
          // source 可能是一个对象，需要从中提取内容
          let source = '';
          if (typeof mail.source === 'string') {
            source = mail.source;
          } else if (mail.source.content) {
            // 尝试从对象中获取 content
            source = typeof mail.source.content === 'string' ? mail.source.content : JSON.stringify(mail.source.content);
          } else if (mail.source.body) {
            source = typeof mail.source.body === 'string' ? mail.source.body : JSON.stringify(mail.source.body);
          } else {
            // 打印对象的所有键，尝试找到内容
            console.log('Source object:', JSON.stringify(mail.source).substring(0, 500));
          }
          
          // 查找邮件正文（在空行之后的内容）
          const bodyMatch = source.match(/\r\n\r\n([\s\S]+)$/);
          if (bodyMatch && bodyMatch[1]) {
            let content = bodyMatch[1];
            // 处理 Quoted-Printable 编码
            content = content.replace(/=[\r\n]/g, '').replace(/=[0-9A-F]{2}/gi, (m: string) => {
              try { return String.fromCharCode(parseInt(m.slice(1), 16)); } catch { return ''; }
            });
            // 移除邮件签名等
            content = content.split(/--\r\n/)[0].trim();
            bodyText = content;
          }
        }
        
        // 清理 HTML 标签
        const body = bodyText.replace(/<[^>]*>/g, '').substring(0, 500);
        
        result.push({
          uid: mail.uid,
          subject: mail.envelope?.subject || '(无主题)',
          from: mail.envelope?.from?.[0]?.address || mail.envelope?.from?.[0]?.name || '未知',
          fromName: mail.envelope?.from?.[0]?.name || '',
          date: mail.envelope?.date || null,
          body: body,
          hasBody: !!body,
          debug: debugInfo,
        });
      }

      // 反转顺序，最新的在前面
      result.reverse();

      return NextResponse.json({
        success: true,
        total: totalMessages,
        mails: result,
      });
    } catch (err) {
      console.error('IMAP Error:', err);
      return NextResponse.json(
        { success: false, message: `连接邮箱失败: ${(err as Error).message}` },
        { status: 500 }
      );
    } finally {
      await client.logout();
    }
  } catch (error) {
    console.error('Request Error:', error);
    return NextResponse.json(
      { success: false, message: '请求处理失败' },
      { status: 500 }
    );
  }
}
