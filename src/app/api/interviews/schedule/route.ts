import { NextResponse } from 'next/server';
import { addActivity } from '@/data/activity-log';

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
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { candidateIds, time, date, interviewers, user } = body;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Log Activity
  addActivity({
    user: user?.name || 'Admin',
    action: `安排了 ${candidateIds.length} 场面试`,
    role: user?.role || '管理员',
    avatar: user?.avatar || ''
  });

  // In a real app, we would update the database here.
  // For mock, we just return success and the updated fields.
  
  return NextResponse.json({
    success: true,
    message: `成功为 ${candidateIds.length} 位同学安排面试`,
    updatedFields: {
      time,
      date,
      interviewers,
      status: 'pending_interview'
    }
  });
}
