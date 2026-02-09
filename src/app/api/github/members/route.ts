import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings-store';
import { getMembers } from '@/lib/github-store';

/**
 * @swagger
 * /api/github/members:
 *   get:
 *     tags:
 *       - GitHub
 *     summary: List organization members
 *     description: Retrieves a list of members in the GitHub organization (Mock Data)
 *     responses:
 *       200:
 *         description: List of members
 *       500:
 *         description: Failed to fetch members
 */
export async function GET() {
  try {
    const { personalAccessToken, organization } = getSettings().github;

    // Check configuration only if we want to simulate the "Not Configured" state
    if (!personalAccessToken || !organization) {
      return NextResponse.json(
        { error: 'GitHub configuration missing in settings' },
        { status: 500 }
      );
    }

    const members = getMembers();

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
