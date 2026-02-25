import { NextResponse } from 'next/server';
import { getStudentById, updateStudent, getUserById, createActivityLog } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';

/**
 * @swagger
 * /api/resumes/{id}:
 *   get:
 *     tags:
 *       - Resumes
 *     summary: 获取简历详情
 *     description: 根据 ID 获取候选人的详细信息
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
 *         description: 成功获取详情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       401:
 *         description: 未登录
 *       404:
 *         description: 简历不存在
 *       500:
 *         description: 服务器内部错误
 *   patch:
 *     tags:
 *       - Resumes
 *     summary: 更新简历状态
 *     description: 更新候选人的状态、备注或其他信息
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, to_be_scheduled, pending_interview, interviewing, passed, rejected]
 *                 description: 候选人状态
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签
 *               aiScore:
 *                 type: number
 *                 description: AI评分
 *               notes:
 *                 type: string
 *                 description: 备注
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Student'
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

    const students = await getStudentById(studentId);

    if (!students || students.length === 0) {
      return NextResponse.json(
        { success: false, message: '简历不存在' },
        { status: 404 }
      );
    }

    const student = students[0];

    // 获取当前用户信息
    const users = await getUserById(currentUser.id);
    const user = users[0];

    return NextResponse.json({
      id: student.id,
      name: student.name,
      studentId: student.studentId,
      department: student.department,
      major: student.major,
      className: student.className,
      gpa: student.gpa,
      graduationYear: student.graduationYear,
      status: student.status,
      tags: student.tags,
      aiScore: student.aiScore,
      submissionDate: student.submissionDate,
      email: student.email,
      phone: student.phone,
      skills: (student as any).skills,
      summary: (student as any).summary,
      experiences: student.experiences,
      resumePdf: student.resumePdf,
      avatar: user?.avatar || '',
    });
  } catch (error) {
    console.error('Get resume detail error:', error);
    return NextResponse.json(
      { success: false, message: '获取简历详情失败' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const existingStudents = await getStudentById(studentId);
    if (!existingStudents || existingStudents.length === 0) {
      return NextResponse.json(
        { success: false, message: '简历不存在' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      status, tags, aiScore, notes, resumePdf,
      name, studentId: sId, department, major, className,
      gpa, graduationYear, email, phone, experiences, skills, summary
    } = body;

    // 构建更新数据
    const updateData: any = {};

    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;
    if (aiScore !== undefined) updateData.aiScore = aiScore.toString();
    if (notes !== undefined) updateData.notes = notes;
    if (resumePdf !== undefined) updateData.resumePdf = resumePdf;
    if (name !== undefined) updateData.name = name;
    if (sId !== undefined) updateData.studentId = sId;
    if (department !== undefined) updateData.department = department;
    if (major !== undefined) updateData.major = major;
    if (className !== undefined) updateData.className = className;
    if (gpa !== undefined) updateData.gpa = gpa;
    if (graduationYear !== undefined) updateData.graduationYear = graduationYear;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (experiences !== undefined) updateData.experiences = experiences;
    if (skills !== undefined) updateData.skills = skills;
    if (summary !== undefined) updateData.summary = summary;

    // 执行更新
    const updatedStudents = await updateStudent(studentId, updateData);

    if (!updatedStudents || updatedStudents.length === 0) {
      return NextResponse.json(
        { success: false, message: '更新失败' },
        { status: 400 }
      );
    }

    // 获取当前用户信息用于记录活动日志
    const users = await getUserById(currentUser.id);
    const user = users[0];

    // 如果更新了状态，记录活动日志
    if (status) {
      const statusMap: Record<string, string> = {
        'pending': '待筛选',
        'to_be_scheduled': '待安排',
        'pending_interview': '待面试',
        'interviewing': '面试中',
        'passed': '面试通过',
        'rejected': '未通过'
      };

      await createActivityLog({
        user: user?.name || currentUser.name,
        action: `更新候选人 [${existingStudents[0].name}] 状态为 [${statusMap[status] || status}]`,
        role: user?.role || currentUser.role,
        avatar: user?.avatar || '',
        timestamp: new Date(),
        userId: currentUser.id,
      });
    }

    const updatedStudent = updatedStudents[0];

    return NextResponse.json({
      success: true,
      message: '更新成功',
      data: {
        id: updatedStudent.id,
        name: updatedStudent.name,
        studentId: updatedStudent.studentId,
        department: updatedStudent.department,
        major: updatedStudent.major,
        className: updatedStudent.className,
        gpa: updatedStudent.gpa,
        graduationYear: updatedStudent.graduationYear,
        status: updatedStudent.status,
        tags: updatedStudent.tags,
        aiScore: updatedStudent.aiScore,
        submissionDate: updatedStudent.submissionDate,
        email: updatedStudent.email,
        phone: updatedStudent.phone,
        experiences: updatedStudent.experiences,
        skills: (updatedStudent as any).skills,
        summary: (updatedStudent as any).summary,
        resumePdf: updatedStudent.resumePdf,
      },
    });
  } catch (error) {
    console.error('Update resume error:', error);
    return NextResponse.json(
      { success: false, message: '更新简历失败' },
      { status: 500 }
    );
  }
}
