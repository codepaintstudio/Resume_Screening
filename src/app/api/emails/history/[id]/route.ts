import { NextResponse } from 'next/server';
import { getEmailHistoryById, deleteEmailHistory } from '@/lib/db/queries';

/**
 * @swagger
 * /api/emails/history/{id}:
 *   get:
 *     tags:
 *       - Emails
 *     summary: 获取记录详情
 *     description: 获取单条发送记录的详细信息
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 记录 ID
 *     responses:
 *       200:
 *         description: 成功获取详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 templateName:
 *                   type: string
 *                 subject:
 *                   type: string
 *                 content:
 *                   type: string
 *                 recipients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       status:
 *                         type: string
 *                 recipientCount:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   enum: [success, failed, partial]
 *                 sentAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: 记录不存在
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Emails
 *     summary: 删除发送记录
 *     description: 删除指定 ID 的发送记录
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 记录 ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: 删除失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID format' }, { status: 400 });
    }
    
    const result = await getEmailHistoryById(id);
    
    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, message: 'History not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching email history:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID format' }, { status: 400 });
    }
    
    await deleteEmailHistory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting email history:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete history' }, { status: 500 });
  }
}
