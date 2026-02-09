import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { getSettings } from '@/lib/settings-store';

/**
 * @swagger
 * /api/github/invite:
 *   post:
 *     tags:
 *       - GitHub
 *     summary: Invite a user to GitHub organization
 *     description: Sends an invitation to the specified email to join the GitHub organization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user to invite
 *               role:
 *                 type: string
 *                 enum: [admin, direct_member, billing_manager]
 *                 default: direct_member
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

    const octokit = new Octokit({
      auth: personalAccessToken,
    });

    const invitedMembers = [];
    const errors = [];

    for (const username of usernames) {
      try {
        // 1. Get user ID from username
        const userRes = await octokit.users.getByUsername({ username });
        const userId = userRes.data.id;
        const avatarUrl = userRes.data.avatar_url;

        // 2. Invite user by ID
        // https://docs.github.com/en/rest/orgs/members?apiVersion=2022-11-28#create-an-organization-invitation
        await octokit.orgs.createInvitation({
          org: organization,
          invitee_id: userId,
          role: 'direct_member',
        });

        // 3. Add to result list (formatted for frontend)
        invitedMembers.push({
          id: userId.toString(),
          username: username,
          avatar: avatarUrl,
          role: 'member',
          joinedAt: new Date().getFullYear().toString(),
          status: 'invited',
          contributions: {
            commits: 0,
            lastActive: 'Just now'
          }
        });

      } catch (err: any) {
        console.error(`Failed to invite ${username}:`, err);
        errors.push({ username, error: err.message });
      }
    }

    if (invitedMembers.length === 0 && errors.length > 0) {
       return NextResponse.json(
        { error: 'Failed to invite any users', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Invitations processed',
      invited: invitedMembers,
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
