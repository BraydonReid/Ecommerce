import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/api-utils';

/**
 * POST /api/auth/forgot-password
 * Initiates password reset flow
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 requests per 15 minutes per IP
    const ip = getClientIp(request);
    if (!checkRateLimit(`forgot-password:${ip}`, 3, 900000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the merchant
    const merchant = await prisma.merchant.findUnique({
      where: { email },
    });

    // Always return success for security (don't reveal if email exists)
    if (!merchant) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, password reset instructions have been sent.',
      });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Store the reset token expiration time (1 hour)
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    // Store the reset token in the database
    await prisma.passwordResetToken.create({
      data: {
        token: resetTokenHash,
        email: merchant.email,
        expiresAt: resetTokenExpiry,
      },
    });

    // Send reset email if email service is configured
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    try {
      const { sendPasswordResetEmail } = await import('@/lib/email');
      await sendPasswordResetEmail(email, resetUrl);
    } catch {
      // Email service not configured — log in development only
      if (process.env.NODE_ENV === 'development') {
        console.log('Password reset URL:', resetUrl);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists, password reset instructions have been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
