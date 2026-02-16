import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/api-utils';

const resetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    ),
});

/**
 * POST /api/auth/reset-password
 * Resets password using a valid token from forgot-password flow
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per 15 minutes per IP
    const ip = getClientIp(request);
    if (!checkRateLimit(`reset-password:${ip}`, 5, 900000)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validationResult = resetSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;

    // Hash the incoming token to match against stored hash
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find valid, unused, non-expired token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: tokenHash,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new one.' },
        { status: 400 }
      );
    }

    // Find the merchant
    const merchant = await prisma.merchant.findUnique({
      where: { email: resetToken.email },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: 'Account not found.' },
        { status: 404 }
      );
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
