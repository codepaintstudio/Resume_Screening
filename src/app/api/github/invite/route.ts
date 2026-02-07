import { NextResponse } from 'next/server';
import { addMember } from '@/lib/github-store';

/**
 * @swagger
 * /api/github/invite:
 *   post:
 *     tags:
 *       - GitHub
 *     summary: 批量邀请 GitHub 用户
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usernames:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 邀请发送成功
 */
export async function POST(request: Request) {
  try {
    const { usernames } = await request.json();
    
    if (!Array.isArray(usernames)) {
      return NextResponse.json(
        { success: false, message: 'Invalid format' }, 
        { status: 400 }
      );
    }

    const results = usernames.map(username => addMember(username));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ 
      success: true, 
      invited: results 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to send invites' },
      { status: 500 }
    );
  }
}
