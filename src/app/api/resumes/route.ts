import { NextResponse } from 'next/server';
import { mockStudents } from '@/data/mock';
import { addActivity } from '@/data/activity-log';

/**
 * @swagger
 * /api/resumes:
 *   get:
 *     tags:
 *       - Resumes
 *     summary: 获取简历列表
 *     description: 获取所有候选人的简历列表，支持筛选和分页（目前返回模拟数据）
 *     responses:
 *       200:
 *         description: 成功获取列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags:
 *       - Resumes
 *     summary: 上传新简历
 *     description: 批量上传简历数据
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/Student'
 *               - type: object
 *                 properties:
 *                   students:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Student'
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: 上传失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return NextResponse.json(mockStudents);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // Handle both direct array (old) and object with user (new)
  let students = [];
  let user = null;

  if (Array.isArray(body)) {
    students = body;
  } else {
    students = body.students;
    user = body.user;
  }

  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Log Activity
  if (students && students.length > 0) {
    addActivity({
      user: user?.name || 'Admin',
      action: `上传了 ${students.length} 份新简历`,
      role: user?.role || '管理员',
      avatar: user?.avatar || ''
    });
  }
  
  // Return the received data with success status
  return NextResponse.json({ success: true, data: students });
}
