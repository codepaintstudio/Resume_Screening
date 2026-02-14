import { ImapFlow } from 'imapflow';
import { NextResponse } from 'next/server';
import { createEmailHistory, getEmailHistory } from '@/lib/db/queries';

/**
 * @swagger
 * /api/get-inbox:
 *   post:
 *     tags:
 *       - Email
 *     summary: 获取邮箱收件箱并保存到数据库
 *     description: 通过 IMAP 协议连接邮箱服务器获取收件箱邮件，并保存到数据库
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
 *               saveToDb:
 *                 type: boolean
 *                 description: 是否保存到数据库（默认true）
 *     responses:
 *       200:
 *         description: 成功获取收件箱
 *       401:
 *         description: 未登录
 *       500:
 *         description: 服务器错误
 */

// 辅助函数：解析邮件正文
function parseEmailBody(source: string): string {
  if (!source) return '';
  
  // 查找邮件正文（在空行之后的内容）
  const bodyMatch = source.match(/\r\n\r\n([\s\S]+)$/);
  if (bodyMatch && bodyMatch[1]) {
    let content = bodyMatch[1];
    
    // 处理 Quoted-Printable 编码
    content = content.replace(/=[\r\n]/g, '').replace(/=[0-9A-F]{2}/gi, (m: string) => {
      try { return String.fromCharCode(parseInt(m.slice(1), 16)); } catch { return ''; }
    });
    
    // 处理 Base64 编码
    if (content.includes('=?') && content.includes('?=')) {
      content = content.replace(/=\?([^?]+)\?([BQ])\?([^?]*)\?=/gi, (_, charset, encoding, text) => {
        try {
          if (encoding === 'B') {
            return Buffer.from(text, 'base64').toString(charset || 'utf-8');
          } else if (encoding === 'Q') {
            return text.replace(/_/g, ' ').replace(/=[0-9A-F]{2}/gi, (m: string) => 
              String.fromCharCode(parseInt(m.slice(1), 16))
            );
          }
        } catch {
          return text;
        }
        return text;
      });
    }
    
    // 移除邮件签名等
    content = content.split(/--\r\n/)[0].trim();
    
    // 清理 HTML 标签
    content = content.replace(/<[^>]*>/g, '').trim();
    
    return content.substring(0, 1000);
  }
  
  return '';
}

// 辅助函数：从 envelope 获取发件人信息
function parseFrom(envelope: any): { name: string; email: string } {
  const from = envelope?.from?.[0];
  if (!from) return { name: '', email: '' };
  
  return {
    name: from.name || '',
    email: from.address || ''
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      host, 
      port = 993, 
      user, 
      pass, 
      limit = 20,
      saveToDb = true 
    } = body;

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
      const totalMessages = mailbox.exists;
      const rangeStart = Math.max(1, totalMessages - limit + 1);
      
      // 获取邮件的 envelope 信息
      const mails = await client.fetch(`${rangeStart}:*`, {
        envelope: true,
        uid: true,
      });

      const result = [];
      let savedCount = 0;
      let skippedCount = 0;
      
      for await (const mail of mails) {
        const fromInfo = parseFrom(mail.envelope);
        
        // 解析邮件正文
        let bodyText = '';
        // 注意：这里需要额外获取 body，简化处理先返回 envelope 信息
        // 完整实现需要单独获取 body
        
        const mailData = {
          uid: mail.uid,
          subject: mail.envelope?.subject || '(无主题)',
          from: fromInfo.email,
          fromName: fromInfo.name,
          date: mail.envelope?.date?.toISOString() || null,
          body: bodyText,
        };
        
        result.push(mailData);
        
        // 保存到数据库
        if (saveToDb) {
          try {
            await createEmailHistory({
              templateName: `收件箱: ${mailData.subject.substring(0, 50)}`,
              subject: mailData.subject,
              content: JSON.stringify({
                uid: mailData.uid,
                from: mailData.from,
                fromName: mailData.fromName,
                date: mailData.date,
                body: mailData.body,
              }),
              recipients: [{ name: fromInfo.name, email: fromInfo.email, status: 'received' }],
              recipientCount: 1,
              status: 'success',
              sentAt: mailData.date ? new Date(mailData.date) : new Date(),
            });
            savedCount++;
          } catch (dbError) {
            console.error('Save to DB error:', dbError);
            skippedCount++;
          }
        }
      }

      // 反转顺序，最新的在前面
      result.reverse();

      return NextResponse.json({
        success: true,
        total: totalMessages,
        fetched: result.length,
        saved: savedCount,
        skipped: skippedCount,
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

// GET 请求：获取已保存的邮件历史
export async function GET() {
  try {
    const history = await getEmailHistory();
    
    // 解析已保存的邮件内容
    const mails = history.map(item => {
      try {
        const content = JSON.parse(item.content);
        return {
          id: item.id,
          uid: content.uid,
          subject: item.subject,
          from: content.from,
          fromName: content.fromName,
          date: content.date,
          body: content.body,
          savedAt: item.sentAt?.toISOString(),
        };
      } catch {
        return {
          id: item.id,
          subject: item.subject,
          savedAt: item.sentAt?.toISOString(),
        };
      }
    });

    return NextResponse.json({
      success: true,
      total: mails.length,
      mails: mails.reverse(), // 最新的在前面
    });
  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { success: false, message: '获取邮件历史失败' },
      { status: 500 }
    );
  }
}
