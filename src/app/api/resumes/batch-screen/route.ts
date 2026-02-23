import { NextResponse } from 'next/server';
import { getStudents, updateStudent, getUserById, createActivityLog, getAiSettings } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';

/**
 * 调用 AI 服务进行简历筛选
 */
async function callAIScreening(student: any, prompt: string, aiSettings: any): Promise<{ score: number; tags: string[]; reason: string }> {
  const { baseUrl, apiKey, model } = aiSettings.llm;
  
  if (!baseUrl || !apiKey || !model) {
    throw new Error('AI settings not configured');
  }

  const systemPrompt = `你是一个专业的HR助手，负责筛选简历。请根据以下要求对简历进行评分：
1. 评分范围 60-100 分
2. 根据简历内容生成合适的标签（如：优秀、潜力、有经验、匹配度高、待考察）
3. 在判断技能相关匹配时，请进行语义层面的模糊匹配，认为“具备技能”“专业技能”“技能专长”等类似表述含义一致，避免仅因字段名称不同就判定为不匹配
4. 给出简要的筛选理由

请以JSON格式返回结果：
{
  "score": 85,
  "tags": ["优秀", "有经验"],
  "reason": "候选人具备5年以上前端开发经验..."
}`;

  const userPrompt = `请筛选以下简历：
姓名: ${student.name}
投递岗位: ${student.department}
个人总结: ${student.summary || '无'}
技能: ${student.skills || '无'}
经历: ${student.experience || '无'}
学历: ${student.education || '无'}

筛选要求: ${prompt || '根据简历质量进行综合评估'}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // 解析 AI 返回的 JSON
  try {
    const result = JSON.parse(content);
    return {
      score: typeof result.score === 'number' ? result.score : 75,
      tags: Array.isArray(result.tags) ? result.tags : ['待考察'],
      reason: result.reason || ''
    };
  } catch {
    // 如果解析失败，返回默认分数
    return {
      score: 75,
      tags: ['待考察'],
      reason: 'AI 返回格式解析失败，请人工审核'
    };
  }
}

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

    // 获取 AI 设置
    const aiSettings = await getAiSettings();
    const { llm } = aiSettings || {};

    // 检查 AI 是否已配置
    if (!llm?.baseUrl || !llm?.apiKey || !llm?.model) {
      return NextResponse.json(
        { success: false, message: '请先在设置中配置 AI 服务' },
        { status: 400 }
      );
    }

    // 使用 AI 筛选简历
    let screenedCount = 0;
    let failedCount = 0;
    const results: { studentId: number; score: number; tags: string[]; error?: string }[] = [];

    for (const student of pendingStudents) {
      try {
        // 调用 AI 服务进行筛选
        const aiResult = await callAIScreening(student, prompt, { llm });
        
        // 根据分数确定是否通过初筛
        const newStatus = aiResult.score >= 75 ? 'pending_interview' : 'pending';

        await updateStudent(student.id!, {
          aiScore: aiResult.score.toString(),
          status: newStatus as any,
          tags: aiResult.tags,
        });

        results.push({
          studentId: student.id!,
          score: aiResult.score,
          tags: aiResult.tags
        });
        screenedCount++;
      } catch (error) {
        console.error(`AI screening failed for student ${student.id}:`, error);
        failedCount++;
        results.push({
          studentId: student.id!,
          score: 0,
          tags: [],
          error: 'AI 筛选失败'
        });
      }
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
      message: `成功筛选 ${screenedCount} 份简历${failedCount > 0 ? `，${failedCount} 份失败` : ''}`,
      data: {
        screenedCount,
        failedCount,
        department: department || 'all',
        timestamp: new Date().toISOString(),
        results
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
