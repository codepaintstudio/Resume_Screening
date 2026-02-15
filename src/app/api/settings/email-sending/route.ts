import { NextResponse } from 'next/server';
import { getEmailConfig, createOrUpdateEmailConfig } from '@/lib/db/queries';

/**
 * @swagger
 * /api/settings/email-sending:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get email sending settings
 *     description: Retrieves the current email sending configuration
 *     responses:
 *       200:
 *         description: Email sending settings
 *       500:
 *         description: Server error
 *   put:
 *     tags:
 *       - Settings
 *     summary: Update email sending settings
 *     description: Updates the email sending configuration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               host:
 *                 type: string
 *               port:
 *                 type: string
 *               user:
 *                 type: string
 *               pass:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated email sending settings
 *       500:
 *         description: Server error
 */
export async function GET() {
  try {
    const config = await getEmailConfig();
    if (!config) {
      return NextResponse.json({
        host: '',
        port: '',
        user: '',
        pass: ''
      });
    }
    return NextResponse.json({
      host: config.host,
      port: config.port,
      user: config.user,
      pass: config.pass
    });
  } catch (error) {
    console.error('Error fetching email config:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch email config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    await createOrUpdateEmailConfig({
      host: data.host || '',
      port: data.port || '',
      user: data.user || '',
      pass: data.pass || ''
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating email config:', error);
    return NextResponse.json({ success: false, message: 'Failed to update email config' }, { status: 500 });
  }
}
