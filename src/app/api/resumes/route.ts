import { NextResponse } from 'next/server';
import { getStudents, getStudentById, createStudent, createActivityLog, getUserById } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { schema } from '@/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

// 简历 PDF 上传目录
const RESUME_DIR = 'public/uploads/resumes';

/**
 * @swagger
 * /api/resumes:
 *   get:
 *     tags:
 *       - Resumes
 *     summary: 获取简历列表
 *     description: 获取所有候选人的简历列表，支持筛选和分页
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 筛选状态 (pending, to_be_scheduled, pending_interview, interviewing, passed, rejected)
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: 筛选部门
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词 (姓名/邮箱)
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: 筛选标签 (多个用逗号分隔)
 *     responses:
 *       200:
 *         description: 成功获取列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: 未登录
 *       500:
 *         description: 服务器内部错误
 *   post:
 *     tags:
 *       - Resumes
 *     summary: 上传新简历
 *     description: 批量上传简历数据
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               students:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     department:
 *                       type: string
 *                     major:
 *                       type: string
 *                     className:
 *                       type: string
 *                     gpa:
 *                       type: string
 *                     graduationYear:
 *                       type: string
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     experiences:
 *                       type: array
 *                       items:
 *                         type: object
 *     responses:
 *       200:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *       401:
 *         description: 未登录
 *       500:
 *         description: 上传失败
 */
export async function GET(request: Request) {
  try {
    // 验证用户登录状态
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const keyword = searchParams.get('keyword');
    const tags = searchParams.get('tags');

    const offset = (page - 1) * limit;

    // 构建查询条件
    let allStudents = await getStudents();
    
    // 应用筛选条件
    let filteredStudents = allStudents;

    if (status) {
      filteredStudents = filteredStudents.filter(s => s.status === status);
    }

    if (department) {
      filteredStudents = filteredStudents.filter(s => s.department === department);
    }

    if (keyword) {
      const kw = keyword.toLowerCase();
      filteredStudents = filteredStudents.filter(s => 
        s.name?.toLowerCase().includes(kw) || 
        s.email?.toLowerCase().includes(kw)
      );
    }

    if (tags) {
      const tagList = tags.split(',').map(t => t.trim());
      filteredStudents = filteredStudents.filter(s => {
        const studentTags = s.tags;
        if (!studentTags || !Array.isArray(studentTags)) return false;
        return tagList.some(tag => studentTags.includes(tag));
      });
    }

    // 按 ID 降序排序
    filteredStudents.sort((a, b) => (b.id || 0) - (a.id || 0));

    // 分页
    const total = filteredStudents.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedStudents = filteredStudents.slice(offset, offset + limit);

    // 获取当前用户信息用于 avatar
    const users = await getUserById(currentUser.id);
    const user = users[0];

    // 返回数据
    const data = paginatedStudents.map(student => ({
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
      experiences: student.experiences,
      resumePdf: student.resumePdf,
      avatar: user?.avatar || '',
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    return NextResponse.json(
      { success: false, message: '获取简历列表失败' },
      { status: 500 }
    );
  }
}

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

    // 检查 Content-Type 判断是 JSON 还是 FormData
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);
    
    let students: any[] = [];
    let resumeFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      // 处理 FormData 上传（包含文件和 JSON 数据）
      const formData = await request.formData();
      
      console.log('FormData keys:', Array.from(formData.keys()));
      
      // 获取 JSON 数据
      const jsonData = formData.get('data');
      console.log('jsonData:', jsonData);
      if (jsonData) {
        const parsed = JSON.parse(jsonData.toString());
        students = parsed.students || [];
      }
      
      // 获取 PDF 文件
      resumeFile = formData.get('resume') as File | null;
      console.log('resumeFile:', resumeFile);
    } else {
      // 处理纯 JSON 上传
      const body = await request.json();
      students = body.students || [];
    }

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { success: false, message: '请提供简历数据' },
        { status: 400 }
      );
    }

    // 获取用户信息
    const users = await getUserById(currentUser.id);
    const user = users[0];

    // 批量创建简历
    const createdStudents = [];

    // 处理 PDF 文件（如果有）
    let resumePdfPath = '';
    if (resumeFile) {
      // 验证文件类型
      if (resumeFile.type !== 'application/pdf') {
        return NextResponse.json(
          { success: false, message: '仅支持 PDF 格式的简历文件' },
          { status: 400 }
        );
      }

      // 验证文件大小（最大 10MB）
      const maxSize = 10 * 1024 * 1024;
      if (resumeFile.size > maxSize) {
        return NextResponse.json(
          { success: false, message: '简历文件大小不能超过 10MB' },
          { status: 400 }
        );
      }

      // 确保目录存在
      const uploadDir = join(process.cwd(), RESUME_DIR);
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        // 目录可能已存在
      }

      // 生成唯一文件名
      const fileName = `resume_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
      const fileBuffer = await resumeFile.arrayBuffer();
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, Buffer.from(fileBuffer));
      
      resumePdfPath = `/uploads/resumes/${fileName}`;
    }

    for (const student of students) {
      const newStudent = await createStudent({
        name: student.name || '',
        studentId: student.studentId || '',
        department: student.department || '',
        major: student.major || '',
        className: student.className || '',
        gpa: student.gpa || '',
        graduationYear: student.graduationYear || '',
        status: 'pending',
        tags: student.tags || [],
        aiScore: student.aiScore || '0',
        submissionDate: new Date(),
        email: student.email || '',
        phone: student.phone || '',
        experiences: student.experiences || [],
        // 保存 PDF 路径
        resumePdf: resumePdfPath || student.resumePdf || '',
      });
      
      if (newStudent.length > 0) {
        createdStudents.push(newStudent[0]);
      }
    }

    // 记录活动日志
    if (createdStudents.length > 0) {
      await createActivityLog({
        user: user?.name || currentUser.name,
        action: `上传了 ${createdStudents.length} 份新简历${resumePdfPath ? '（含PDF）' : ''}`,
        role: user?.role || currentUser.role,
        avatar: user?.avatar || '',
        timestamp: new Date(),
        userId: currentUser.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: `成功上传 ${createdStudents.length} 份简历`,
      data: createdStudents,
    });
  } catch (error) {
    console.error('Upload resumes error:', error);
    return NextResponse.json(
      { success: false, message: '上传简历失败' },
      { status: 500 }
    );
  }
}
