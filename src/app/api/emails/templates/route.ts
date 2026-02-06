
import { NextResponse } from 'next/server';
import { getTemplates, addTemplate, EmailTemplate } from '@/data/email-mock';

/**
 * @swagger
 * /api/emails/templates:
 *   get:
 *     tags:
 *       - Emails
 *     summary: 获取邮件模板
 *     description: 获取所有可用的邮件模板
 *     responses:
 *       200:
 *         description: 成功获取模板列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   subject:
 *                     type: string
 *                   content:
 *                     type: string
 *                   category:
 *                     type: string
 *   post:
 *     tags:
 *       - Emails
 *     summary: 创建邮件模板
 *     description: 创建新的邮件模板
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subject
 *               - content
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
 *         description: 模板创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 缺少必填字段
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 创建失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  return NextResponse.json(getTemplates());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, subject, content, category } = body;
    
    if (!name || !subject || !content) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name,
      subject,
      content,
      category: category || '通用'
    };

    addTemplate(newTemplate);
    return NextResponse.json({ success: true, data: newTemplate });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create template' }, { status: 500 });
  }
}
