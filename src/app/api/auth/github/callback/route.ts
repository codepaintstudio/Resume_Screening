import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings-store';

/**
 * @swagger
 * /api/auth/github/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Handle GitHub OAuth Callback
 *     description: Exchanges code for token and retrieves user info
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: OAuth authorization code
 *     responses:
 *       302:
 *         description: Redirect to dashboard on success or login on failure
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=github_auth_failed', request.url));
  }

  try {
    const { clientId, clientSecret } = getSettings().github;

    if (!clientId || !clientSecret) {
      console.error('GitHub credentials not configured');
      return NextResponse.redirect(new URL('/login?error=server_configuration', request.url));
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub token error:', tokenData.error_description);
      return NextResponse.redirect(new URL('/login?error=github_token_error', request.url));
    }

    const accessToken = tokenData.access_token;

    // Fetch user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    // Fetch user email if not public
    let email = userData.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary && e.verified);
      if (primaryEmail) email = primaryEmail.email;
    }

    // TODO: 
    // 1. Check if user exists in database
    // 2. If yes, log them in (create session/JWT)
    // 3. If no, create new user account
    // 4. Set session cookies

    // For now, just redirect to dashboard with a success flag
    // In production, NEVER pass user data in URL parameters like this
    const dashboardUrl = new URL('/', request.url);
    // dashboardUrl.searchParams.set('login_success', 'true');
    
    return NextResponse.redirect(dashboardUrl);

  } catch (err) {
    console.error('GitHub auth error:', err);
    return NextResponse.redirect(new URL('/login?error=internal_error', request.url));
  }
}
