import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * POST /api/auth/forgot-password
 * Initiates password reset flow
 *
 * In production, this would:
 * 1. Generate a secure reset token
 * 2. Store it in the database with an expiration
 * 3. Send an email with the reset link
 *
 * For now, we log the token for development purposes
 */
export async function POST(request: NextRequest) {
  try {
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

    // Update the merchant with the reset token
    // Note: In a complete implementation, you would have a separate PasswordResetToken model
    // For now, we're storing it temporarily - implement email sending before going to production
    await prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        // These fields would need to be added to the schema for full implementation:
        // passwordResetToken: resetTokenHash,
        // passwordResetExpiry: resetTokenExpiry,
        updatedAt: new Date(), // Just update timestamp for now
      },
    });

    // TODO: Implement email sending service (SendGrid, Resend, AWS SES, etc.)
    // const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    // await sendResetEmail(email, resetUrl);

    // Log only in development mode, and never log the actual token
    if (process.env.NODE_ENV === 'development') {
      // In development, you would typically use a service like Mailhog or Ethereal
      // to catch emails locally instead of logging tokens
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
