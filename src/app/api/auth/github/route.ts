import { NextResponse } from 'next/server';

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
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`
    : 'http://localhost:3000/api/auth/github/callback';

  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json(
      { error: 'GitHub Client ID not configured' },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'read:user user:email',
    state: Math.random().toString(36).substring(7), // Simple state for CSRF protection
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(githubAuthUrl);
}
