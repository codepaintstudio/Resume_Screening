import { NextResponse } from 'next/server';
import { getStudentById } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

/**
 * @swagger
 * /api/resumes/{id}/pdf:
 *   get:
 *     tags:
 *       - Resumes
 *     summary: 预览简历 PDF
 *     description: 在线预览指定候选人的简历 PDF
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
 *         description: 返回 PDF 文件流
 *       401:
 *         description: 未登录
 *       404:
 *         description: 简历不存在或没有上传 PDF
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

    // 从数据库获取学生信息
    const students = await getStudentById(studentId);
    if (!students || students.length === 0) {
      return NextResponse.json(
        { success: false, message: '简历不存在' },
        { status: 404 }
      );
    }

    const student = students[0];

    // 检查是否有简历 PDF
    if (!student.resumePdf) {
      return NextResponse.json(
        { success: false, message: '该候选人没有上传简历' },
        { status: 404 }
      );
    }

    // 拼接成服务器上的绝对路径
    const absolutePath = path.join(process.cwd(), 'public', student.resumePdf);

    // 检查文件是否存在
    try {
      await fs.access(absolutePath);
    } catch {
      return NextResponse.json(
        { success: false, message: '简历文件不存在' },
        { status: 404 }
      );
    }

    // 读取文件为 Buffer
    const fileBuffer = await fs.readFile(absolutePath);

    // 返回 PDF 文件流，使用 inline 模式预览
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="resume_${studentId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Preview PDF error:', error);
    return NextResponse.json(
      { success: false, message: '预览 PDF 失败' },
      { status: 500 }
    );
  }
}
