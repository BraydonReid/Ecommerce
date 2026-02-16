import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/api-utils';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    ),
  shopName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 registrations per 15 minutes per IP
    const ip = getClientIp(request);
    if (!checkRateLimit(`register:${ip}`, 5, 900000)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, shopName } = validationResult.data;

    // Check if user already exists
    const existingMerchant = await prisma.merchant.findUnique({
      where: { email },
    });

    if (existingMerchant) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create merchant
    const merchant = await prisma.merchant.create({
      data: {
        email,
        password: hashedPassword,
        subscriptionTier: 'free',
        // If shopName provided, we could use it for display purposes
        // For now, we store it in the shopifyShop field temporarily
        // until they connect their actual Shopify store
      },
    });

    // Create default settings for the merchant
    await prisma.merchantSettings.create({
      data: {
        merchantId: merchant.id,
        defaultPackagingType: 'cardboard',
        defaultPackagingWeight: 0.1,
        defaultShippingMode: 'road',
        trackingEnabled: true,
        enableAIInsights: false,
        emailReports: false,
        reportFrequency: 'monthly',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        merchant: {
          id: merchant.id,
          email: merchant.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
