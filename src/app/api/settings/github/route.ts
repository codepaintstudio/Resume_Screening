import { NextResponse } from 'next/server';
import { getGithubSettings, createOrUpdateGithubSettings } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';

/**
 * @swagger
 * /api/settings/github:
 *   get:
 *     tags:
 *       - Settings
 *     summary: 获取 GitHub 配置
 *     description: 获取 GitHub OAuth 和管理功能的配置信息 (需要管理员权限)
 *     responses:
 *       200:
 *         description: 成功获取配置
 *       401:
 *         description: 未授权
 *   put:
 *     tags:
 *       - Settings
 *     summary: 更新 GitHub 配置
 *     description: 更新 GitHub OAuth 和管理功能的配置信息 (需要管理员权限)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *               clientSecret:
 *                 type: string
 *               organization:
 *                 type: string
 *               personalAccessToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 配置已更新
 *       401:
 *         description: 未授权
 */

// Authentication middleware using real database
const checkAdmin = async (request: Request) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return false;
  }
  // Check if user has admin role
  return currentUser.role === 'admin';
};

export async function GET(request: Request) {
  const isAdmin = await checkAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  try {
    const settings = await getGithubSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching GitHub settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAdmin = await checkAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const settings = await createOrUpdateGithubSettings({
      clientId: body.clientId,
      clientSecret: body.clientSecret,
      organization: body.organization,
      personalAccessToken: body.personalAccessToken
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating GitHub settings:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
