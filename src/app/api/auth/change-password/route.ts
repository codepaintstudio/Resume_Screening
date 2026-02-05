import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    // Mock validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: '请输入当前密码和新密码' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: '新密码长度至少需6位' },
        { status: 400 }
      );
    }

    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success
    return NextResponse.json({ 
      success: true, 
      message: '密码修改成功' 
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: '修改密码失败' },
      { status: 500 }
    );
  }
}
