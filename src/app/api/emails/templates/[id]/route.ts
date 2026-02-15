
import { NextResponse } from 'next/server';
import { getEmailTemplateById, updateEmailTemplate, deleteEmailTemplate } from '@/lib/db/queries';

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
 *           type: integer
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
 *       500:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *           type: integer
 *         description: 模板 ID
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
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid template ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, subject, content, category } = body;

    // Check if template exists
    const existing = await getEmailTemplateById(id);
    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 });
    }

    const updated = await updateEmailTemplate(id, {
      ...(name && { name }),
      ...(subject && { subject }),
      ...(content && { content }),
      ...(category && { category }),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Failed to update template:', error);
    return NextResponse.json({ success: false, message: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid template ID' }, { status: 400 });
    }

    // Check if template exists
    const existing = await getEmailTemplateById(id);
    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 });
    }

    await deleteEmailTemplate(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete template' }, { status: 500 });
  }
}
