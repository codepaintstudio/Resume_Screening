import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/resumes/{id}/download:
 *   get:
 *     tags:
 *       - Resumes
 *     summary: 下载简历
 *     description: 下载指定候选人的简历文件（重定向到 PDF）
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 候选人 ID
 *     responses:
 *       307:
 *         description: 临时重定向到文件地址
 *       200:
 *         description: 成功获取文件
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Redirect to the dummy PDF for download
  return NextResponse.redirect('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
}
