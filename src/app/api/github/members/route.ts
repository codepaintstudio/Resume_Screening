import { NextResponse } from 'next/server';
import { getGitHubState } from '@/lib/github-store';

/**
 * @swagger
 * /api/github/members:
 *   get:
 *     tags:
 *       - GitHub
 *     summary: 获取 GitHub 组织成员列表
 *     responses:
 *       200:
 *         description: 成功获取成员列表
 */
export async function GET() {
  const state = getGitHubState();
  return NextResponse.json(state);
}
