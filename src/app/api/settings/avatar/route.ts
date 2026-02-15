import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById, updateUser } from '@/lib/db/queries';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// 头像上传目录
const AVATAR_DIR = 'public/uploads/avatars';

/**
 * @swagger
 * /api/settings/avatar:
 *   post:
 *     tags:
 *       - Settings
 *     summary: 上传用户头像
 *     description: 上传并更新当前用户的头像图片
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: 头像图片文件
 *     responses:
 *       200:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 avatarUrl:
 *                   type: string
 *                   description: 头像访问URL
 *       400:
 *         description: 参数错误或文件类型不支持
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未登录
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request: Request) {
  try {
    // 获取当前登录用户
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File | null;

    if (!avatarFile) {
      return NextResponse.json(
        { success: false, message: '请选择头像图片' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(avatarFile.type)) {
      return NextResponse.json(
        { success: false, message: '不支持的图片格式，请上传 JPG、PNG、GIF 或 WebP 格式' },
        { status: 400 }
      );
    }

    // 验证文件大小（最大 2MB）
    const maxSize = 2 * 1024 * 1024;
    if (avatarFile.size > maxSize) {
      return NextResponse.json(
        { success: false, message: '图片大小不能超过 2MB' },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const fileExt = avatarFile.name.split('.').pop() || 'jpg';
    const fileName = `avatar_${currentUser.id}_${Date.now()}.${fileExt}`;
    
    // 确保目录存在
    const uploadDir = join(process.cwd(), AVATAR_DIR);
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // 目录可能已存在，忽略错误
    }

    // 保存文件
    const fileBuffer = await avatarFile.arrayBuffer();
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, Buffer.from(fileBuffer));

    // 生成访问 URL
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // 更新数据库中的头像路径
    await updateUser(currentUser.id, { avatar: avatarUrl });

    return NextResponse.json({
      success: true,
      avatarUrl: avatarUrl,
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return NextResponse.json(
      { success: false, message: '上传头像失败' },
      { status: 500 }
    );
  }
}
