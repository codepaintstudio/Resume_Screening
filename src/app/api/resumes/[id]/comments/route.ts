import { NextResponse } from 'next/server';
import { getCommentsByStudentId, createComment, getStudentById, getUserById, createActivityLog } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';

/**
 * @swagger
 * /api/resumes/{id}/comments:
 *   get:
 *     tags:
 *       - Resumes
 *     summary: 获取简历评论
 *     description: 获取指定候选人的所有评论记录
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *                     type: integer
 *                   studentId:
 *                     type: integer
 *                   user:
 *                     type: string
 *                   role:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   content:
 *                     type: string
 *                   time:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *       401:
 *         description: 未登录
 *       404:
 *         description: 简历不存在
 *       500:
 *         description: 服务器内部错误
 *   post:
 *     tags:
 *       - Resumes
 *     summary: 添加评论
 *     description: 为指定候选人添加新的评论
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *                 description: 评论内容
 *     responses:
 *       200:
 *         description: 评论添加成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: 未登录
 *       404:
 *         description: 简历不存在
 *       500:
 *         description: 服务器内部错误
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户登录状态
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const studentId = parseInt(id);

    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, message: '无效的简历ID' },
        { status: 400 }
      );
    }

    // 检查简历是否存在
    const students = await getStudentById(studentId);
    if (!students || students.length === 0) {
      return NextResponse.json(
        { success: false, message: '简历不存在' },
        { status: 404 }
      );
    }

    // 获取评论列表
    const comments = await getCommentsByStudentId(studentId);

    // 返回评论数据
    return NextResponse.json(comments.map(comment => ({
      id: comment.id,
      studentId: comment.studentId,
      user: comment.user,
      role: comment.role,
      avatar: comment.avatar,
      content: comment.content,
      time: comment.time,
      timestamp: comment.timestamp,
    })));
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { success: false, message: '获取评论失败' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户登录状态
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const studentId = parseInt(id);

    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, message: '无效的简历ID' },
        { status: 400 }
      );
    }

    // 检查简历是否存在
    const students = await getStudentById(studentId);
    if (!students || students.length === 0) {
      return NextResponse.json(
        { success: false, message: '简历不存在' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { success: false, message: '请输入评论内容' },
        { status: 400 }
      );
    }

    // 获取当前用户信息
    const users = await getUserById(currentUser.id);
    const user = users[0];

    // 生成时间字符串
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const commentData = {
      studentId: studentId,
      user: user?.name || currentUser.name || '匿名用户',
      role: user?.role || currentUser.role || '面试官',
      avatar: user?.avatar || '',
      content: content.trim(),
      time: timeString,
      timestamp: now,
      userId: currentUser.id, // 保存评论者的用户ID
    };
    
    console.log('Creating comment with data:', JSON.stringify(commentData));

    // 创建评论 - 保存到数据库
    const newComments = await createComment(commentData);

    console.log('Create comment result:', newComments);

    if (!newComments || newComments.length === 0) {
      console.error('Comment insert failed: no result returned');
      return NextResponse.json(
        { success: false, message: '添加评论失败' },
        { status: 500 }
      );
    }

    // 记录活动日志
    await createActivityLog({
      user: user?.name || currentUser.name || '匿名用户',
      action: `评论了候选人 [${students[0].name}]`,
      role: user?.role || currentUser.role || '面试官',
      avatar: user?.avatar || '',
      timestamp: new Date(),
    });

    const newComment = newComments[0];

    return NextResponse.json({
      success: true,
      data: {
        id: newComment.id,
        studentId: newComment.studentId,
        user: newComment.user,
        role: newComment.role,
        avatar: newComment.avatar,
        content: newComment.content,
        time: newComment.time,
        timestamp: newComment.timestamp,
      },
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { success: false, message: '添加评论失败' },
      { status: 500 }
    );
  }
}
