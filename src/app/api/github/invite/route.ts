import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings-store';
import { addMembers, Member } from '@/lib/github-store';

/**
 * @swagger
 * /api/github/invite:
 *   post:
 *     tags:
 *       - GitHub
 *     summary: Invite a user to GitHub organization
 *     description: Sends an invitation to the specified email to join the GitHub organization (Mock Data)
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

    // Mock invitation logic
    const newMembers: Member[] = usernames.map((username: string) => ({
      id: Math.random().toString(36).substring(7),
      username,
      avatar: `https://github.com/${username}.png`, // Mock avatar
      role: 'member',
      joinedAt: new Date().getFullYear().toString(),
      status: 'invited',
      contributions: {
        commits: 0,
        lastActive: 'Just now'
      }
    }));

    const added = addMembers(newMembers);

    return NextResponse.json({
      message: 'Invitations processed (Mock)',
      invited: added,
      // errors: [] 
    });

  } catch (error: any) {
    console.error('GitHub invite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
