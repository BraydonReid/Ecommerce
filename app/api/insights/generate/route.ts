import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/api-utils';
import { generateAIInsights } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    if (!checkRateLimit(`insights:${userId}`, 10, 3600000)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
    }

    const merchant = await prisma.merchant.findUnique({ where: { id: userId } });
    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    if (merchant.subscriptionTier === 'free') {
      return NextResponse.json({ error: 'AI insights require Premium subscription' }, { status: 403 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const emissions = await prisma.emissionRecord.findMany({
      where: { merchantId: merchant.id, calculatedAt: { gte: thirtyDaysAgo } },
      include: { order: true },
    });

    if (emissions.length === 0) {
      return NextResponse.json({ error: 'Not enough data. Sync orders first.' }, { status: 400 });
    }

    const totalCO2e = emissions.reduce((sum, e) => sum + e.totalCO2e, 0);
    const shippingCO2e = emissions.reduce((sum, e) => sum + e.shippingCO2e, 0);
    const packagingCO2e = emissions.reduce((sum, e) => sum + e.packagingCO2e, 0);
    const metricsData = {
      period: 'last 30 days',
      orderCount: emissions.length,
      totalCO2e,
      shippingCO2e,
      packagingCO2e,
    };

    const insights = await generateAIInsights(metricsData);
    const currentPeriod = new Date().toISOString().slice(0, 7);
    
    await prisma.aIInsight.create({
      data: {
        merchantId: merchant.id,
        period: currentPeriod,
        summary: insights.summary,
        recommendations: insights.recommendations,
        metrics: metricsData as any,
      },
    });

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
