import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings-store';
import { addMembers, Member } from '@/lib/github-store';

/**
 * 调用 GitHub API 发送组织邀请
 */
async function sendGitHubInvite(organization: string, username: string, token: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 首先检查用户是否存在
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!userResponse.ok) {
      return { success: false, error: `用户 ${username} 不存在` };
    }

    // 发送组织邀请
    const inviteResponse = await fetch(`https://api.github.com/orgs/${organization}/invitations`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invitee_id: username
      })
    });

    if (!inviteResponse.ok) {
      const errorData = await inviteResponse.json();
      return { success: false, error: errorData.message || '邀请失败' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: '调用 GitHub API 失败' };
  }
}

/**
 * @swagger
 * /api/github/invite:
 *   post:
 *     tags:
 *       - GitHub
 *     summary: Invite a user to GitHub organization
 *     description: Sends an invitation to the specified GitHub username to join the GitHub organization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usernames
 *             properties:
 *               usernames:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to send invitation
 */
export async function POST(request: Request) {
  try {
    const { usernames } = await request.json();

    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
      return NextResponse.json(
        { error: 'Usernames array is required' },
        { status: 400 }
      );
    }

    const { personalAccessToken, organization } = getSettings().github;

    if (!personalAccessToken || !organization) {
      return NextResponse.json(
        { error: 'GitHub configuration missing in settings' },
        { status: 500 }
      );
    }

    // 使用 GitHub API 发送邀请
    const invited: Member[] = [];
    const errors: string[] = [];

    for (const username of usernames) {
      const result = await sendGitHubInvite(organization, username, personalAccessToken);
      
      if (result.success) {
        // 添加到本地成员列表（作为已邀请状态）
        const newMember: Member = {
          id: Math.random().toString(36).substring(7),
          username,
          avatar: `https://github.com/${username}.png`,
          role: 'member',
          joinedAt: new Date().getFullYear().toString(),
          status: 'invited',
          contributions: {
            commits: 0,
            lastActive: 'Just now'
          }
        };
        invited.push(newMember);
      } else {
        errors.push(result.error || `Failed to invite ${username}`);
      }
    }

    // 将成功邀请的成员添加到本地存储
    if (invited.length > 0) {
      addMembers(invited);
    }

    return NextResponse.json({
      message: errors.length === 0 
        ? `成功邀请 ${invited.length} 位成员` 
        : `邀请了 ${invited.length} 位成员，${errors.length} 位失败`,
      invited,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('GitHub invite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
