import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { aggregateShippingCosts, getProviderBreakdown } from '@/lib/shipping-provider';
import { ShippingCostsResponse } from '@/types';

/**
 * GET /api/shipping/costs
 * Returns aggregated shipping costs and metrics for a merchant
 * Query params: shop (required), period (optional: 7d, 30d, 90d, 365d)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Get merchant
    const merchant = await prisma.merchant.findUnique({
      where: { id: userId },
    });

    if (!merchant) {
      return errorResponse('Merchant not found', 404);
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '365d':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get summary metrics
    const summary = await aggregateShippingCosts(merchant.id, startDate, now);

    // Get breakdown by provider
    const byProvider = await getProviderBreakdown(merchant.id, startDate, now);

    // Get service level breakdown
    const records = await prisma.orderShippingRecord.findMany({
      where: {
        merchantId: merchant.id,
        createdAt: { gte: startDate, lte: now },
      },
      include: {
        order: {
          include: {
            emissions: true,
          },
        },
      },
    });

    // Group by service level
    const byServiceLevelMap = new Map<string, {
      serviceLevel: string;
      orderCount: number;
      totalCost: number;
      totalCO2e: number;
    }>();

    for (const record of records) {
      const serviceLevel = record.detectedServiceLevel || 'standard';
      const existing = byServiceLevelMap.get(serviceLevel) || {
        serviceLevel,
        orderCount: 0,
        totalCost: 0,
        totalCO2e: 0,
      };

      existing.orderCount += 1;
      existing.totalCost += record.shippingCost;
      existing.totalCO2e += record.order.emissions[0]?.shippingCO2e || 0;

      byServiceLevelMap.set(serviceLevel, existing);
    }

    const byServiceLevel = Array.from(byServiceLevelMap.values())
      .map(s => ({
        ...s,
        totalCost: Math.round(s.totalCost * 100) / 100,
        totalCO2e: Math.round(s.totalCO2e * 1000) / 1000,
      }))
      .sort((a, b) => b.orderCount - a.orderCount);

    // Get trend data (daily breakdown)
    const trendMap = new Map<string, {
      date: string;
      cost: number;
      orders: number;
      co2e: number;
    }>();

    for (const record of records) {
      const dateStr = record.createdAt.toISOString().split('T')[0];
      const existing = trendMap.get(dateStr) || {
        date: dateStr,
        cost: 0,
        orders: 0,
        co2e: 0,
      };

      existing.cost += record.shippingCost;
      existing.orders += 1;
      existing.co2e += record.order.emissions[0]?.shippingCO2e || 0;

      trendMap.set(dateStr, existing);
    }

    const trend = Array.from(trendMap.values())
      .map(t => ({
        ...t,
        cost: Math.round(t.cost * 100) / 100,
        co2e: Math.round(t.co2e * 1000) / 1000,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const response: ShippingCostsResponse = {
      summary,
      byProvider,
      byServiceLevel,
      trend,
    };

    return successResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}
