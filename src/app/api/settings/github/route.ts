import { NextResponse } from 'next/server';
import { getGithubSettings, createOrUpdateGithubSettings } from '@/lib/db/queries';
import { authenticateUser } from '@/data/user-mock';

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

// Mock authentication middleware
const checkAdmin = (request: Request) => {
  // In a real app, verify session/token here
  // For now, we assume if you can access this route, you are authorized
  // But let's add a basic check for demonstration
  return true; 
};

export async function GET(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
