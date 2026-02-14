import { NextResponse } from 'next/server';
import { getStudentById } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * @swagger
 * /api/resumes/{id}/download:
 *   get:
 *     tags:
 *       - Resumes
 *     summary: 下载简历
 *     description: 下载指定候选人的简历文件
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
 *         description: 成功返回 PDF 文件
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: 未登录
 *       404:
 *         description: 简历不存在或没有上传简历
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

    const student = students[0];

    // 检查是否有简历 PDF
    if (!student.resumePdf) {
      return NextResponse.json(
        { success: false, message: '该候选人没有上传简历' },
        { status: 404 }
      );
    }

    // 获取文件路径
    const resumePath = student.resumePdf;
    
    // 如果是外部 URL，直接重定向
    if (resumePath.startsWith('http://') || resumePath.startsWith('https://')) {
      return NextResponse.redirect(resumePath);
    }

    // 本地文件路径
    const filePath = join(process.cwd(), 'public', resumePath);

    // 检查文件是否存在
    if (!existsSync(filePath)) {
      console.error('Resume file not found:', filePath);
      return NextResponse.json(
        { success: false, message: '简历文件不存在' },
        { status: 404 }
      );
    }

    // 读取文件
    const fileBuffer = await readFile(filePath);

    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${student.name || 'resume'}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Download resume error:', error);
    return NextResponse.json(
      { success: false, message: '下载简历失败' },
      { status: 500 }
    );
  }
}
