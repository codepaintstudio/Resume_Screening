import { NextResponse } from 'next/server';
import { addUser, checkUserExists } from '@/data/user-mock';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, code } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    // Mock code verification
    if (code && code !== '888888') { // Simple mock check
       // For now let's just ignore code or make it optional for demo, or enforce it
    }

    if (checkUserExists(email)) {
      return NextResponse.json(
        { success: false, message: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    const newUser = addUser({
      email,
      password,
      name: email.split('@')[0], // Default name
      role: 'member', // Default role
      department: '未分配'
    });

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '注册服务异常' },
      { status: 500 }
    );
  }
}
