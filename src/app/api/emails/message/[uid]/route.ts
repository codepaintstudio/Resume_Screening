import { ImapFlow } from 'imapflow';
import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings-store';

function decodeBodyText(raw: string): string {
  return raw
    .replace(/=[\r\n]/g, '')
    .replace(/=[0-9A-F]{2}/gi, (m: string) => {
      try {
        return String.fromCharCode(parseInt(m.slice(1), 16));
      } catch {
        return '';
      }
    })
    .split(/--\r\n/)[0]
    .trim();
}

function findAttachments(node: any, path: number[] = []): { part: string; type: string; size: number; filename: string }[] {
  const attachments: { part: string; type: string; size: number; filename: string }[] = [];

  if (
    node.disposition === 'attachment' ||
    (node.type && node.type !== 'text' && node.type !== 'multipart' && !node.disposition)
  ) {
    attachments.push({
      part: path.length ? path.join('.') : '1',
      type: `${node.type}/${node.subtype || 'octet-stream'}`,
      size: node.size || 0,
      filename:
        node.dispositionParameters?.filename ||
        node.parameters?.name ||
        'attachment',
    });
  }

  if (node.childNodes) {
    node.childNodes.forEach((child: any, i: number) => {
      attachments.push(...findAttachments(child, [...path, i + 1]));
    });
  }

  return attachments;
}

export async function POST(request: Request, { params }: { params: { uid: string } }) {
  try {
    const body = await request.json().catch(() => ({}));
    const settings = await getSettings();
    const host = body.host ?? settings.resumeImport.imapServer;
    const port = Number(body.port ?? settings.resumeImport.port ?? 993);
    const user = body.user ?? settings.resumeImport.account;
    const pass = body.pass ?? settings.resumeImport.authCode;

    if (!host || !user || !pass || !params.uid) {
      return NextResponse.json(
        { success: false, message: '请配置 IMAP（服务器/账号/授权码）' },
        { status: 400 }
      );
    }

    const client = new ImapFlow({
      host,
      port,
      secure: true,
      auth: { user, pass },
    });

    try {
      await client.connect();
      await client.mailboxOpen('INBOX');

      const uid = params.uid;
      const message: any = await (client as any).fetchOne(
        uid,
        {
          envelope: true,
          bodyStructure: true,
          bodyParts: ['TEXT'],
        },
        { uid: true }
      );

      if (!message) {
        return NextResponse.json({ success: false, message: '未找到该邮件' }, { status: 404 });
      }

      let bodyText = '';
      const textPart = message.bodyParts?.get('TEXT');
      if (textPart) {
        bodyText = decodeBodyText(textPart.toString());
      }

      const basicAttachments = message.bodyStructure
        ? findAttachments(message.bodyStructure)
        : [];

      const attachments = [];

      for (const att of basicAttachments) {
        const isImage = att.type.startsWith('image/');
        let size = att.size;
        let contentBase64: string | undefined;

        if (isImage) {
          const { content } = await (client as any).download(message.uid, att.part, { uid: true });
          const chunks: Buffer[] = [];
          for await (const chunk of content as AsyncIterable<Uint8Array>) {
            chunks.push(Buffer.from(chunk));
          }
          const buffer = Buffer.concat(chunks);
          size = buffer.length;
          contentBase64 = buffer.toString('base64');
        }

        attachments.push({
          name: att.filename,
          part: att.part,
          type: att.type,
          size,
          isImage,
          contentBase64,
        });
      }

      return NextResponse.json({
        success: true,
        mail: {
          uid: message.uid,
          subject: message.envelope?.subject || '(无主题)',
          from: message.envelope?.from?.[0]?.address || message.envelope?.from?.[0]?.name || '未知',
          fromName: message.envelope?.from?.[0]?.name || '',
          date: message.envelope?.date || null,
          body: bodyText,
          attachments,
        },
      });
    } catch (err) {
      return NextResponse.json(
        { success: false, message: (err as Error).message },
        { status: 500 }
      );
    } finally {
      await client.logout();
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '请求处理失败' },
      { status: 500 }
    );
  }
}
