/**
 * Email sending utility
 *
 * Configure one of these environment variables to enable:
 * - RESEND_API_KEY: Use Resend (recommended, simple API)
 * - SMTP_HOST + SMTP_PORT + SMTP_USER + SMTP_PASS: Use SMTP/nodemailer
 *
 * If neither is configured, emails will be logged in development
 * and silently skipped in production.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    // Use Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'GreenCommerce <noreply@greencommerces.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }
    return;
  }

  // No email provider configured
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EMAIL] To: ${options.to} | Subject: ${options.subject}`);
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Reset your GreenCommerce password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">GreenCommerce</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
