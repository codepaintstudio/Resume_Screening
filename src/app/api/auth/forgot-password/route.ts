import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db/queries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: '请输入邮箱地址' },
        { status: 400 }
      );
    }

    const users = await getUserByEmail(email);

    return NextResponse.json({
      success: true,
      message: users.length > 0
        ? '已受理重置请求，请联系管理员重置密码'
        : '如果该邮箱已注册，我们会处理重置请求',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: '重置请求提交失败' },
      { status: 500 }
    );
  }
}
