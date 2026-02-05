import { NextResponse } from 'next/server';
import { getComments, addComment } from '@/data/comments-mock';
import { addActivity } from '@/data/activity-log';

/**
 * @swagger
 * /api/resumes/{id}/comments:
 *   get:
 *     tags:
 *       - Resumes
 *     summary: 获取简历评论
 *     description: 获取指定候选人的所有评论记录
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 候选人 ID
 *     responses:
 *       200:
 *         description: 成功获取评论列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   user:
 *                     type: string
 *                   role:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   content:
 *                     type: string
 *                   date:
 *                     type: string
 *   post:
 *     tags:
 *       - Resumes
 *     summary: 添加评论
 *     description: 为指定候选人添加新的评论
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 候选人 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               user:
 *                 $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: 评论添加成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300)); // Reduced delay for better feel

  const comments = getComments(id);
  
  return NextResponse.json(comments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const body = await request.json();
  const { content, user } = body;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!content) {
    return NextResponse.json({ success: false, message: 'Content is required' }, { status: 400 });
  }

  const newComment = addComment({
    studentId: id,
    user: user?.name || 'Me', // In real app, get from session
    role: user?.role || '面试官',
    avatar: user?.avatar || 'M',
    content: content
  });

  // Log Activity
  addActivity({
    user: user?.name || 'Me',
    action: `评论了候选人 [ID:${id}]`,
    role: user?.role || '面试官',
    avatar: user?.avatar || ''
  });

  return NextResponse.json({
    success: true,
    data: newComment
  });
}
