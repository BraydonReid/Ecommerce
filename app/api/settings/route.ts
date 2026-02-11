import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for settings update
const settingsSchema = z.object({
  defaultPackagingType: z.enum(['cardboard', 'plastic', 'paper', 'biodegradable', 'mixed']),
  defaultPackagingWeight: z.number().min(0).max(100),
  enableAIInsights: z.boolean(),
  emailReports: z.boolean(),
  reportFrequency: z.enum(['weekly', 'monthly', 'quarterly']),
});

/**
 * GET /api/settings
 * Fetch merchant settings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const shop = request.nextUrl.searchParams.get('shop');

    let merchant;

    if (shop) {
      // Find by shop domain
      merchant = await prisma.merchant.findUnique({
        where: { shopifyShop: shop },
        include: { settings: true },
      });
    } else if (session?.user) {
      // Find by session user ID
      merchant = await prisma.merchant.findUnique({
        where: { id: (session.user as any).id },
        include: { settings: true },
      });
    }

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    // Create default settings if not exists
    let settings = merchant.settings;
    if (!settings) {
      settings = await prisma.merchantSettings.create({
        data: {
          merchantId: merchant.id,
          defaultPackagingType: 'cardboard',
          defaultPackagingWeight: 0.1,
          enableAIInsights: false,
          emailReports: false,
          reportFrequency: 'monthly',
        },
      });
    }

    return NextResponse.json({
      settings: {
        defaultPackagingType: settings.defaultPackagingType,
        defaultPackagingWeight: settings.defaultPackagingWeight,
        enableAIInsights: settings.enableAIInsights,
        emailReports: settings.emailReports,
        reportFrequency: settings.reportFrequency,
      },
      merchant: {
        email: merchant.email,
        shopifyShop: merchant.shopifyShop,
        subscriptionTier: merchant.subscriptionTier,
        stripeCustomerId: merchant.stripeCustomerId,
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * PUT /api/settings
 * Update merchant settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const shop = request.nextUrl.searchParams.get('shop');

    let merchant;

    if (shop) {
      merchant = await prisma.merchant.findUnique({
        where: { shopifyShop: shop },
      });
    } else if (session?.user) {
      merchant = await prisma.merchant.findUnique({
        where: { id: (session.user as any).id },
      });
    }

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = settingsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { defaultPackagingType, defaultPackagingWeight, enableAIInsights, emailReports, reportFrequency } =
      validationResult.data;

    // Check if AI insights is available for this subscription tier
    if (enableAIInsights && merchant.subscriptionTier === 'free') {
      return NextResponse.json(
        { error: 'AI Insights requires a Premium subscription' },
        { status: 403 }
      );
    }

    // Upsert settings
    const settings = await prisma.merchantSettings.upsert({
      where: { merchantId: merchant.id },
      update: {
        defaultPackagingType,
        defaultPackagingWeight,
        enableAIInsights,
        emailReports,
        reportFrequency,
      },
      create: {
        merchantId: merchant.id,
        defaultPackagingType,
        defaultPackagingWeight,
        enableAIInsights,
        emailReports,
        reportFrequency,
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        defaultPackagingType: settings.defaultPackagingType,
        defaultPackagingWeight: settings.defaultPackagingWeight,
        enableAIInsights: settings.enableAIInsights,
        emailReports: settings.emailReports,
        reportFrequency: settings.reportFrequency,
      },
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
