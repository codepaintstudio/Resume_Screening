
import { NextResponse } from 'next/server';
import { deleteTemplate, updateTemplate } from '@/data/email-mock';

/**
 * @swagger
 * /api/emails/templates/{id}:
 *   put:
 *     tags:
 *       - Emails
 *     summary: 更新邮件模板
 *     description: 更新指定 ID 的邮件模板内容
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模板 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: 模板不存在
 *   delete:
 *     tags:
 *       - Emails
 *     summary: 删除邮件模板
 *     description: 删除指定 ID 的邮件模板
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模板 ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await request.json();
    const updated = updateTemplate(id, body);
    
    if (updated) {
      return NextResponse.json({ success: true, data: updated });
    } else {
      return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  deleteTemplate(id);
  return NextResponse.json({ success: true });
}
