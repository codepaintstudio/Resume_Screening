import { NextResponse } from 'next/server';
import { getStudents, updateStudent, getUserById, createActivityLog } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';

/**
 * @swagger
 * /api/resumes/batch-screen:
 *   post:
 *     tags:
 *       - Resumes
 *     summary: 批量 AI 筛选
 *     description: 使用 AI 根据设定条件批量筛选简历
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *                 description: 筛选部门 (为空表示所有部门)
 *               prompt:
 *                 type: string
 *                 description: AI 筛选提示词
 *     responses:
 *       200:
 *         description: 筛选任务启动成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     screenedCount:
 *                       type: integer
 *                     department:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       401:
 *         description: 未登录
 *       500:
 *         description: 服务器内部错误
 */
export async function POST(request: Request) {
  try {
    // 验证用户登录状态
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { department, prompt } = body;

    // 获取所有简历
    let students = await getStudents();

    // 根据部门筛选
    if (department && department !== 'all') {
      students = students.filter(s => s.department === department);
    }

    // 只筛选待处理的简历
    const pendingStudents = students.filter(s => s.status === 'pending');

    // 获取当前用户信息
    const users = await getUserById(currentUser.id);
    const user = users[0];

    // 模拟 AI 筛选过程
    // 在实际应用中，这里会调用 AI 服务来筛选简历
    // 这里随机给一些简历分配 AI 分数和标签
    let screenedCount = 0;
    const updatedStudents = [];

    for (const student of pendingStudents) {
      // 模拟 AI 评分 (60-100分)
      const aiScore = Math.floor(Math.random() * 41) + 60;
      
      // 根据分数确定是否通过初筛
      const newStatus = aiScore >= 75 ? 'pending_interview' : 'pending';
      
      // 生成一些标签
      const possibleTags = ['优秀', '潜力', '有经验', '匹配度高', '待考察'];
      const numTags = Math.floor(Math.random() * 3) + 1;
      const shuffled = possibleTags.sort(() => 0.5 - Math.random());
      const selectedTags = shuffled.slice(0, numTags);

      await updateStudent(student.id!, {
        aiScore: aiScore.toString(),
        status: newStatus as any,
        tags: selectedTags,
      });

      updatedStudents.push(student.id);
      screenedCount++;
    }

    // 记录活动日志
    await createActivityLog({
      user: user?.name || currentUser.name,
      action: `使用 AI 批量筛选了 [${department === 'all' || !department ? '所有部门' : department}] 的 ${screenedCount} 份简历`,
      role: user?.role || currentUser.role,
      avatar: user?.avatar || '',
      timestamp: new Date(),
      userId: currentUser.id,
    });

    return NextResponse.json({
      success: true,
      message: `成功筛选 ${screenedCount} 份简历`,
      data: {
        screenedCount,
        department: department || 'all',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Batch screening error:', error);
    return NextResponse.json(
      { success: false, message: '批量筛选失败' },
      { status: 500 }
    );
  }
}
