import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings-store';

/**
 * @swagger
 * /api/auth/github:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Initiate GitHub OAuth Login
 *     description: Redirects user to GitHub for authentication
 *     responses:
 *       302:
 *         description: Redirect to GitHub
 */
export async function GET() {
  const settings = await getSettings();
  const { clientId } = settings.github;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`
    : 'http://localhost:3000/api/auth/github/callback';

  if (!clientId) {
    return NextResponse.json(
      { error: 'GitHub Client ID not configured in System Settings' },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    scope: 'read:user user:email',
    state: Math.random().toString(36).substring(7), // Simple state for CSRF protection
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(githubAuthUrl);
}
