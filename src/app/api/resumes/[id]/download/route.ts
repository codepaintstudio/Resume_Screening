import { NextResponse } from 'next/server';
import { getStudentById } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';

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
 *       307:
 *         description: 临时重定向到文件地址
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

    const student = students[0];

    // TODO: 实际应用中，这里应该返回实际存储的 PDF 文件
    // 目前暂时重定向到示例 PDF
    // 在生产环境中，可以使用云存储（OSS/AWS S3）或本地文件系统
    
    // 示例 PDF 地址（可替换为实际文件存储路径）
    const downloadUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    
    // 重定向到文件地址
    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error('Download resume error:', error);
    return NextResponse.json(
      { success: false, message: '下载简历失败' },
      { status: 500 }
    );
  }
}
