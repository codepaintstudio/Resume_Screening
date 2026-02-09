import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { getSettings } from '@/lib/settings-store';

/**
 * @swagger
 * /api/github/members:
 *   get:
 *     tags:
 *       - GitHub
 *     summary: List organization members
 *     description: Retrieves a list of members in the GitHub organization
 *     responses:
 *       200:
 *         description: List of members
 *       500:
 *         description: Failed to fetch members
 */
export async function GET() {
  try {
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

    const response = await octokit.orgs.listMembers({
      org: organization,
      per_page: 100,
    });

    const members = response.data.map((member: any) => ({
      id: member.id.toString(),
      username: member.login,
      avatar: member.avatar_url,
      role: member.site_admin ? 'owner' : 'member',
      joinedAt: '2024', // GitHub API doesn't return join date in list endpoint
      status: 'active',
      contributions: {
        commits: 0, // Requires separate API calls
        lastActive: 'Recently'
      }
    }));

    return NextResponse.json({
      organization,
      members
    });

  } catch (error: any) {
    console.error('GitHub members error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
