import { NextResponse } from 'next/server';
import { getStudents, updateStudent, getUserById, createActivityLog, getAiSettings } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';

/**
 * 调用 AI 服务进行简历筛选
 */
async function callAIScreening(student: any, prompt: string, matchKeywords: string, aiSettings: any): Promise<{ score: number; tags: string[]; reason: string; matchScore: number }> {
  const { baseUrl, apiKey, model } = aiSettings.llm;

  if (!baseUrl || !apiKey || !model) {
    throw new Error('AI settings not configured');
  }

  // 计算简单的模糊匹配分数 (0-100)
  const calculateMatchScore = (student: any, keywords: string): number => {
    if (!keywords) return 0;
    const kws = keywords.split(/[,，\s]+/).filter(Boolean);
    if (kws.length === 0) return 0;

    const studentText = [
      student.name,
      student.department,
      student.major,
      student.summary,
      JSON.stringify(student.experiences || []),
      JSON.stringify(student.skills || []),
      (Array.isArray(student.tags) ? student.tags : []).join(' ')
    ].join(' ').toLowerCase();

    let matches = 0;
    kws.forEach(kw => {
      if (studentText.includes(kw.toLowerCase())) {
        matches++;
      }
    });

    return Math.round((matches / kws.length) * 100);
  };

  const matchScore = calculateMatchScore(student, matchKeywords);
  const finalUrl = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  console.log(`[AI] Calling: ${finalUrl} with model: ${model}`);

  const systemPrompt = `你是一个专业的HR助手，负责筛选简历。请根据以下要求对简历进行评分：
1. 评分范围 60-100 分
2. 根据简历内容生成合适的标签（如：优秀、潜力、有经验、匹配度高、待考察）
3. 在判断技能相关匹配时，请进行语义层面的模糊匹配，认为“具备技能”“专业技能”“技能专长”等类似表述含义一致，避免仅因字段名称不同就判定为不匹配
4. 重点关注以下匹配关键词：${matchKeywords || '无'}
5. 给出简要的筛选理由

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
技能: ${JSON.stringify(student.skills || '无')}
经历: ${JSON.stringify(student.experiences || '无')}
学历: ${student.major || '无'}

筛选要求: ${prompt || '根据简历质量进行综合评估'}
模糊匹配关键词: ${matchKeywords || '无'}
基础匹配得分: ${matchScore}`;

  // 设置 30 秒超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(finalUrl, {
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
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = JSON.stringify(errorData);
      } catch {
        errorDetail = response.statusText || `Status ${response.status}`;
      }
      throw new Error(`AI API error: ${errorDetail}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 解析 AI 返回的 JSON
    try {
      const result = JSON.parse(content);
      return {
        score: typeof result.score === 'number' ? result.score : 75,
        tags: Array.isArray(result.tags) ? result.tags : ['待考察'],
        reason: result.reason || '',
        matchScore: matchScore
      };
    } catch {
      // 如果解析失败，返回默认分数
      return {
        score: 75,
        tags: ['待考察'],
        reason: 'AI 返回格式解析失败，请人工审核',
        matchScore: matchScore
      };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('AI API request timed out');
    }
    throw err;
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
    const { department, prompt, matchKeywords, dateRange } = body;

    // 获取所有简历
    let students = await getStudents();

    // 根据时间范围筛选
    if (dateRange && (dateRange.from || dateRange.to)) {
      const fromDate = dateRange.from ? new Date(dateRange.from) : null;
      const toDate = dateRange.to ? new Date(dateRange.to) : null;

      // 设置时间为当天的开始和结束
      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);

      students = students.filter(s => {
        if (!s.submissionDate) return false;
        const subDate = new Date(s.submissionDate);
        if (fromDate && subDate < fromDate) return false;
        if (toDate && subDate > toDate) return false;
        return true;
      });
    }

    // 根据部门筛选
    if (department && department !== 'all') {
      students = students.filter(s =>
        s.department?.trim() === department.trim()
      );
    }

    // 只筛选待处理的简历
    const pendingStudents = students.filter(s => s.status === 'pending');

    if (pendingStudents.length === 0) {
      return NextResponse.json(
        { success: false, message: '没有待筛选的简历' },
        { status: 400 }
      );
    }

    // 获取当前用户信息
    const users = await getUserById(currentUser.id);
    const user = users[0];

    // 获取 AI 设置
    const aiSettings = await getAiSettings();
    const { llm } = aiSettings || {};

    // 检查 AI 是否已配置
    if (!llm?.baseUrl || !llm?.apiKey || !llm?.model) {
      console.error('Missing AI Config:', { llm });
      return NextResponse.json(
        { success: false, message: '请先在设置中配置 AI 服务 (Base URL, API Key, Model)' },
        { status: 400 }
      );
    }

    // 使用 AI 筛选简历
    let screenedCount = 0;
    let failedCount = 0;
    const results: { studentId: number; score: number; tags: string[]; error?: string }[] = [];

    for (const student of pendingStudents) {
      try {
        console.log(`Processing student ${student.id}: ${student.name}`);
        // 调用 AI 服务进行筛选
        const aiResult = await callAIScreening(student, prompt, matchKeywords, { llm });

        // 根据分数确定是否通过初筛
        const newStatus = aiResult.score >= 75 ? 'pending_interview' : 'pending';

        // 综合 AI 分数和模糊匹配分数
        const finalTags = [...aiResult.tags];
        if (matchKeywords) {
          // 总是显示匹配度，如果用户提供了关键词
          finalTags.push(`匹配度: ${aiResult.matchScore}%`);
        }

        console.log(`Updating student ${student.id} with score ${aiResult.score}`);
        await updateStudent(student.id!, {
          aiScore: aiResult.score.toString(),
          status: newStatus as any,
          tags: finalTags,
        });

        results.push({
          studentId: student.id!,
          score: aiResult.score,
          tags: finalTags
        });
        screenedCount++;
      } catch (error: any) {
        console.error(`AI screening failed for student ${student.id}:`, error.message);
        failedCount++;
        results.push({
          studentId: student.id!,
          score: 0,
          tags: [],
          error: error.message || 'AI 筛选失败'
        });
      }
    }

    if (screenedCount === 0 && failedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `筛选任务全部失败: ${results[0]?.error || '未知错误'}`,
          data: { failedCount, results }
        },
        { status: 500 }
      );
    }

    // 记录活动日志
    const matchInfo = matchKeywords ? `，关键词: ${matchKeywords}` : '';
    await createActivityLog({
      user: user?.name || currentUser.name,
      action: `使用 AI 批量筛选了 [${department === 'all' || !department ? '所有部门' : department}] 的 ${screenedCount} 份简历${matchInfo}`,
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
