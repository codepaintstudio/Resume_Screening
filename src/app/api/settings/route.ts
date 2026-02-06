import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/settings:
 *   get:
 *     tags:
 *       - System
 *     summary: 获取系统设置
 *     description: 获取包含个人、平台、AI、通知等的全局配置
 *     responses:
 *       200:
 *         description: 成功获取配置
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 personal:
 *                   type: object
 *                   properties:
 *                     avatar:
 *                       type: string
 *                     displayName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     department:
 *                       type: string
 *                 platform:
 *                   type: object
 *                   properties:
 *                     departments:
 *                       type: array
 *                       items:
 *                         type: string
 *                 ai:
 *                   type: object
 *                   properties:
 *                     vision:
 *                       type: object
 *                       properties:
 *                         endpoint:
 *                           type: string
 *                         model:
 *                           type: string
 *                         apiKey:
 *                           type: string
 *                     llm:
 *                       type: object
 *                       properties:
 *                         baseUrl:
 *                           type: string
 *                         apiKey:
 *                           type: string
 *                         model:
 *                           type: string
 *                 notifications:
 *                   type: object
 *                   properties:
 *                     webhookUrl:
 *                       type: string
 *                     triggers:
 *                       type: object
 *                       properties:
 *                         new_resume:
 *                           type: boolean
 *                         interview_reminder:
 *                           type: boolean
 *                         offer_confirmed:
 *                           type: boolean
 *                 resumeImport:
 *                   type: object
 *                   properties:
 *                     imapServer:
 *                       type: string
 *                     port:
 *                       type: string
 *                     account:
 *                       type: string
 *                     password:
 *                       type: string
 *                 apiKeys:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       key:
 *                         type: string
 *                       created:
 *                         type: string
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags:
 *       - System
 *     summary: 更新系统设置
 *     description: 增量更新系统配置
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 包含需更新的配置项对象，结构与GET响应一致
 *             example:
 *               personal:
 *                 displayName: "新名称"
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: 更新失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Mock database for settings
let settings = {
  personal: {
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    displayName: '张老师',
    email: 'admin@mahui.com',
    department: '技术部', // Added department
  },
  platform: {
    departments: ['前端部', 'UI部', '办公室', '运维'],
  },
  ai: {
    vision: {
      endpoint: '',
      model: 'vision-vk-v2',
      apiKey: '',
    },
    llm: {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: '',
    },
  },
  notifications: {
    webhookUrl: '',
    triggers: {
      'new_resume': true,
      'interview_reminder': true,
      'offer_confirmed': true,
    }
  },
  resumeImport: {
    imapServer: 'imap.exmail.qq.com',
    port: '993',
    account: '',
    password: '',
  },
  apiKeys: [
    { id: '1', name: 'HR Portal Integration', key: 'sk_live_51M...', created: '2024-02-15' }
  ]
};

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const updates = await request.json();
    
    // Deep merge updates
    settings = {
      ...settings,
      ...updates,
      // Handle nested objects carefully if needed, but for now simple spread works 
      // if the frontend sends the whole section or we handle it here.
      // Let's assume frontend sends partial updates keyed by section.
    };

    // Specific handling for nested updates if sent partially
    if (updates.personal) settings.personal = { ...settings.personal, ...updates.personal };
    if (updates.platform) settings.platform = { ...settings.platform, ...updates.platform };
    if (updates.ai) {
        settings.ai = { 
            ...settings.ai, 
            ...updates.ai,
            vision: { ...settings.ai.vision, ...(updates.ai.vision || {}) },
            llm: { ...settings.ai.llm, ...(updates.ai.llm || {}) }
        };
    }
    if (updates.notifications) settings.notifications = { ...settings.notifications, ...updates.notifications };
    if (updates.resumeImport) settings.resumeImport = { ...settings.resumeImport, ...updates.resumeImport };
    if (updates.apiKeys) settings.apiKeys = updates.apiKeys;

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to save settings' }, { status: 500 });
  }
}
