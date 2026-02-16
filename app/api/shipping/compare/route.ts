import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import {
  generateComparisons,
  getBestAlternatives,
  aggregateShippingCosts,
} from '@/lib/shipping-provider';
import { CompareResponse } from '@/types';

/**
 * POST /api/shipping/compare
 * Generates comparisons with alternative shipping providers
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { orderId, periodStart, periodEnd, weight, distance } = body;

    // Get merchant
    const merchant = await prisma.merchant.findUnique({
      where: { id: userId },
      include: {
        shippingOptimization: true,
      },
    });

    if (!merchant) {
      return errorResponse('Merchant not found', 404);
    }

    let currentProvider: CompareResponse['currentProvider'];
    let avgWeight: number;
    let avgDistance: number;

    if (orderId) {
      // Order-level comparison
      const record = await prisma.orderShippingRecord.findFirst({
        where: {
          orderId,
          merchantId: merchant.id,
        },
        include: {
          order: {
            include: {
              emissions: true,
            },
          },
          matchedProvider: true,
        },
      });

      if (!record) {
        return errorResponse('Order shipping record not found', 404);
      }

      currentProvider = {
        name: record.matchedProvider?.displayName || record.detectedProviderName || 'Unknown',
        cost: record.shippingCost,
        co2e: record.order.emissions[0]?.shippingCO2e || 0,
      };

      avgWeight = record.order.totalWeight || 1;
      avgDistance = record.order.shippingDistance || 500;
    } else {
      // Aggregated comparison
      const startDate = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = periodEnd ? new Date(periodEnd) : new Date();

      const summary = await aggregateShippingCosts(merchant.id, startDate, endDate);

      // Get most used provider
      const records = await prisma.orderShippingRecord.findMany({
        where: {
          merchantId: merchant.id,
          createdAt: { gte: startDate, lte: endDate },
        },
        include: {
          matchedProvider: true,
        },
      });

      const providerCounts = new Map<string, number>();
      for (const record of records) {
        const name = record.matchedProvider?.displayName || record.detectedProviderName || 'Unknown';
        providerCounts.set(name, (providerCounts.get(name) || 0) + 1);
      }

      let topProvider = 'Unknown';
      let maxCount = 0;
      for (const [name, count] of Array.from(providerCounts.entries())) {
        if (count > maxCount) {
          topProvider = name;
          maxCount = count;
        }
      }

      currentProvider = {
        name: topProvider,
        cost: summary.totalCost,
        co2e: summary.totalCO2e,
      };

      // Calculate average weight and distance
      const orders = await prisma.order.findMany({
        where: {
          merchantId: merchant.id,
          createdAt: { gte: startDate, lte: endDate },
        },
      });

      const totalWeight = orders.reduce((sum, o) => sum + (o.totalWeight || 0), 0);
      const totalDistance = orders.reduce((sum, o) => sum + (o.shippingDistance || 0), 0);
      const orderCount = orders.length || 1;

      avgWeight = weight || (totalWeight / orderCount) || 1;
      avgDistance = distance || (totalDistance / orderCount) || 500;
    }

    // Generate alternatives
    const alternatives = await generateComparisons(
      currentProvider.cost,
      currentProvider.co2e,
      avgWeight,
      avgDistance,
      merchant.shippingOptimization
    );

    // Get best recommendations
    const bestAlternatives = getBestAlternatives(alternatives);

    const response: CompareResponse = {
      currentProvider,
      alternatives: alternatives.slice(0, 10), // Top 10 alternatives
      recommendation: {
        bestForCost: bestAlternatives.bestForCost || 'N/A',
        bestForCarbon: bestAlternatives.bestForCarbon || 'N/A',
        bestOverall: bestAlternatives.bestOverall || 'N/A',
      },
    };

    return successResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}
