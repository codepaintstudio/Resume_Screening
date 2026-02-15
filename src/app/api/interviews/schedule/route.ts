import { NextResponse } from 'next/server';
import { addActivity } from '@/data/activity-log';
import { updateInterview, getInterviewsByStudentId, updateStudent, getStudentById } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';
import { schema, db } from '@/lib/db';

/**
 * @swagger
 * /api/interviews/schedule:
 *   post:
 *     tags:
 *       - Interviews
 *     summary: 安排面试
 *     description: 为一位或多位候选人安排面试时间与面试官
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateIds
 *               - time
 *               - date
 *             properties:
 *               candidateIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               time:
 *                 type: string
 *                 example: "14:00"
 *               date:
 *                 type: string
 *                 example: "2024-03-20"
 *               interviewers:
 *                 type: array
 *                 items:
 *                   type: string
 *               user:
 *                 $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: 面试安排成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateIds, time, date, interviewers, location, user } = body;

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { success: false, message: '请提供候选人ID列表' },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    const failedIds: string[] = [];

    // 遍历每个候选人，更新面试信息
    for (const candidateId of candidateIds) {
      try {
        // 将 candidateId 转换为数字（数据库使用数字ID）
        const studentId = parseInt(candidateId, 10);
        
        if (isNaN(studentId)) {
          failedIds.push(candidateId);
          continue;
        }

        // 构建更新数据
        const updateData: Partial<typeof schema.interviews.$inferInsert> = {
          time: time || '',
          date: date ? new Date(date) : undefined,
          interviewers: interviewers || [],
          location: location || '',
          stage: 'pending_interview',
          updatedAt: new Date(),
        };

        // 使用 studentId 查询并更新面试记录
        const existingInterview = await getInterviewsByStudentId(studentId);
        
        if (existingInterview && existingInterview.length > 0) {
          // 更新现有面试记录
          await updateInterview(existingInterview[0].id, updateData);
          // 同时更新学生状态
          await updateStudent(studentId, { status: 'pending_interview' });
          updatedCount++;
        } else {
          // 如果没有面试记录，创建新的面试记录
          // 先获取学生信息
          const studentInfo = await getStudentById(studentId);
          if (!studentInfo || studentInfo.length === 0) {
            failedIds.push(candidateId);
            continue;
          }
          const student = studentInfo[0];
          
          await db.insert(schema.interviews).values({
            studentId,
            name: student.name || '',
            major: student.major || '',
            department: student.department || '',
            gpa: student.gpa || '',
            aiScore: student.aiScore || '0',
            tags: student.tags || [],
            email: student.email || '',
            phone: student.phone || '',
            className: student.className || '',
            skills: student.skills || [],
            experiences: student.experiences || [],
            time: time || '',
            date: date ? new Date(date) : undefined,
            interviewers: interviewers || [],
            location: location || '',
            stage: 'pending_interview',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          // 同时更新学生状态
          await updateStudent(studentId, { status: 'pending_interview' });
          updatedCount++;
        }
      } catch (err) {
        console.error(`Failed to update interview for candidate ${candidateId}:`, err);
        failedIds.push(candidateId);
      }
    }

    // 记录活动日志
    addActivity({
      user: user?.name || 'Admin',
      action: `安排了 ${updatedCount} 场面试`,
      role: user?.role || '管理员',
      avatar: user?.avatar || ''
    });

    if (failedIds.length > 0) {
      return NextResponse.json({
        success: updatedCount > 0,
        message: `成功安排 ${updatedCount} 场面试，${failedIds.length} 个失败`,
        failedIds,
        updatedFields: {
          time,
          date,
          interviewers,
          location,
          status: 'pending_interview'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `成功为 ${updatedCount} 位同学安排面试`,
      updatedFields: {
        time,
        date,
        interviewers,
        location,
        status: 'pending_interview'
      }
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    return NextResponse.json(
      { success: false, message: '安排面试失败', error: String(error) },
      { status: 500 }
    );
  }
}
