import { NextResponse } from 'next/server';
import { getSettings, updateSection } from '@/lib/settings-store';
import { useAppStore } from '@/store';

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
 */
export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json(settings.emailSending);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // In a real app, we would validate admin permissions here
    // For this demo, we assume the middleware or client-side check is sufficient
    
    const updated = updateSection('emailSending', data);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
