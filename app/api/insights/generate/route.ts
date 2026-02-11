import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAIInsights } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const shop = request.nextUrl.searchParams.get('shop');
    if (!shop) {
      return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
    }

    const merchant = await prisma.merchant.findUnique({ where: { shopifyShop: shop } });
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

    const totalEmissions = emissions.reduce((sum, e) => sum + e.totalCO2e, 0);
    const metricsData = {
      period: 'last 30 days',
      totalOrders: emissions.length,
      totalEmissions: totalEmissions.toFixed(2),
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
