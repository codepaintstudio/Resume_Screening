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

    if (!student.resumePdf) {
      return NextResponse.json(
        { success: false, message: '该候选人没有上传简历' },
        { status: 404 }
      );
    }
    const relativePath = student.resumePdf.startsWith('/')
      ? student.resumePdf.slice(1)
      : student.resumePdf;
    const absolutePath = path.join(process.cwd(), 'public', relativePath);

    try {
      await fs.access(absolutePath);
    } catch {
      return NextResponse.json(
        { success: false, message: '简历文件不存在' },
        { status: 404 }
      );
    }

    const fileBuffer = await fs.readFile(absolutePath);

    const ext = path.extname(student.resumePdf || '').toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="resume_${studentId}${ext || ''}"`,
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
