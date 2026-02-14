import { ImapFlow } from 'imapflow';
import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings-store';

export async function POST(request: Request, { params }: { params: { uid: string } }) {
  try {
    const body = await request.json().catch(() => ({}));
    const settings = getSettings();
    const host = body.host ?? settings.resumeImport.imapServer;
    const port = Number(body.port ?? settings.resumeImport.port ?? 993);
    const user = body.user ?? settings.resumeImport.account;
    const pass = body.pass ?? settings.resumeImport.password;

    if (!host || !user || !pass || !params.uid) {
      return NextResponse.json({ success: false, message: '请配置 IMAP（服务器/账号/授权码）' }, { status: 400 });
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

      const uidNum = Number(params.uid);
      const result: any[] = [];
      const fetched = await client.fetch({ uid: uidNum } as any, {
        envelope: true,
        uid: true,
        body: true,
        attachments: true,
      } as any);

      for await (const mail of fetched as any) {
        let bodyText = '';
        if (mail.body?.text) {
          bodyText = mail.body.text;
        } else if (mail.body?.html) {
          bodyText = mail.body.html.replace(/<[^>]*>/g, '');
        }
        bodyText = bodyText
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

        const attachments =
          mail.attachments?.map((att: any) => ({
            name: att.filename || att.name,
            size: att.size,
            type: att.contentType,
          })) || [];

        result.push({
          uid: mail.uid,
          subject: mail.envelope?.subject || '(无主题)',
          from: mail.envelope?.from?.[0]?.address || mail.envelope?.from?.[0]?.name || '未知',
          fromName: mail.envelope?.from?.[0]?.name || '',
          date: mail.envelope?.date || null,
          body: bodyText,
          attachments,
        });
      }

      if (result.length === 0) {
        return NextResponse.json({ success: false, message: '未找到该邮件' }, { status: 404 });
      }

      return NextResponse.json({ success: true, mail: result[0] });
    } catch (err) {
      return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 });
    } finally {
      await client.logout();
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: '请求处理失败' }, { status: 500 });
  }
}
