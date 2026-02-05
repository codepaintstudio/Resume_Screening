import { NextResponse } from 'next/server';
import { authenticateUser } from '@/data/user-mock';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    const user = authenticateUser(email, password);

    if (user) {
      // In a real app, we would set a session cookie here
      return NextResponse.json({
        success: true,
        user,
        token: 'mock-jwt-token-' + user.id // Mock token
      });
    } else {
      return NextResponse.json(
        { success: false, message: '邮箱或密码错误' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '登录服务异常' },
      { status: 500 }
    );
  }
}
