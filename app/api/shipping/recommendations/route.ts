import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import {
  aggregateShippingCosts,
  getProviderBreakdown,
  generateComparisons,
} from '@/lib/shipping-provider';
import { ShippingRecommendationsResponse, ShippingRecommendation } from '@/types';

/**
 * GET /api/shipping/recommendations
 * Returns personalized shipping optimization recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }
    const userId = (session.user as any).id;

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

    // Get last 30 days of data
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    // Get current shipping metrics
    const summary = await aggregateShippingCosts(merchant.id, startDate, endDate);
    const providerBreakdown = await getProviderBreakdown(merchant.id, startDate, endDate);

    // If no shipping data, return empty recommendations
    if (summary.totalOrders === 0) {
      const emptyResponse: ShippingRecommendationsResponse = {
        summary: {
          potentialCostSavings: 0,
          potentialCO2Reduction: 0,
          potentialCostSavingsPercent: 0,
          potentialCO2ReductionPercent: 0,
        },
        recommendations: [],
      };
      return successResponse(emptyResponse);
    }

    // Get average order metrics
    const orders = await prisma.order.findMany({
      where: {
        merchantId: merchant.id,
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const avgWeight = orders.reduce((sum, o) => sum + (o.totalWeight || 0), 0) / orders.length || 1;
    const avgDistance = orders.reduce((sum, o) => sum + (o.shippingDistance || 0), 0) / orders.length || 500;

    // Generate comparisons to find best alternatives
    const alternatives = await generateComparisons(
      summary.avgCostPerOrder,
      summary.avgCO2ePerOrder,
      avgWeight,
      avgDistance,
      merchant.shippingOptimization
    );

    // Calculate potential savings
    let potentialCostSavings = 0;
    let potentialCO2Reduction = 0;

    if (alternatives.length > 0) {
      // Find best cost saver
      const bestCostSaver = alternatives.reduce((best, curr) =>
        curr.costSavings > best.costSavings ? curr : best
      );
      // Find best carbon saver
      const bestCarbonSaver = alternatives.reduce((best, curr) =>
        curr.co2Savings > best.co2Savings ? curr : best
      );

      if (bestCostSaver.costSavings > 0) {
        potentialCostSavings = bestCostSaver.costSavings * summary.totalOrders;
      }
      if (bestCarbonSaver.co2Savings > 0) {
        potentialCO2Reduction = bestCarbonSaver.co2Savings * summary.totalOrders;
      }
    }

    // Generate recommendations
    const recommendations: ShippingRecommendation[] = [];

    // Check if switching providers could save money/carbon
    if (providerBreakdown.length > 0 && alternatives.length > 0) {
      const topProvider = providerBreakdown[0];
      const bestAlternative = alternatives[0];

      // Provider switch recommendation
      if (bestAlternative.costSavings > 0 || bestAlternative.co2Savings > 0) {
        recommendations.push({
          type: 'provider_switch',
          title: `Switch to ${bestAlternative.providerName} ${bestAlternative.serviceLevel}`,
          description: `Switching from ${topProvider.providerName} to ${bestAlternative.providerName} ${bestAlternative.serviceLevel} could save you ${bestAlternative.costSavingsPercent}% on costs and reduce carbon emissions by ${bestAlternative.co2SavingsPercent}%.`,
          estimatedCostSavings: bestAlternative.costSavings * summary.totalOrders,
          estimatedCO2Savings: bestAlternative.co2Savings * summary.totalOrders,
          priority: bestAlternative.recommendationScore > 30 ? 'high' : bestAlternative.recommendationScore > 15 ? 'medium' : 'low',
          affectedOrdersPercent: topProvider.percentOfOrders,
        });
      }

      // Service downgrade recommendation (if using express/overnight a lot)
      const overnightRecords = await prisma.orderShippingRecord.findMany({
        where: {
          merchantId: merchant.id,
          createdAt: { gte: startDate, lte: endDate },
          detectedServiceLevel: { in: ['overnight', 'express'] },
        },
      });

      const expressPercent = (overnightRecords.length / summary.totalOrders) * 100;
      if (expressPercent > 20) {
        // Find ground alternative
        const groundAlternative = alternatives.find(a =>
          a.serviceLevel.toLowerCase().includes('ground') ||
          a.serviceLevel.toLowerCase().includes('standard')
        );

        if (groundAlternative && (groundAlternative.costSavings > 0 || groundAlternative.co2Savings > 0)) {
          recommendations.push({
            type: 'service_downgrade',
            title: 'Consider standard shipping for non-urgent orders',
            description: `${Math.round(expressPercent)}% of your orders use express/overnight shipping. Switching to ground shipping when possible could significantly reduce costs and carbon emissions.`,
            estimatedCostSavings: (groundAlternative.costSavings * overnightRecords.length),
            estimatedCO2Savings: (groundAlternative.co2Savings * overnightRecords.length),
            priority: expressPercent > 40 ? 'high' : 'medium',
            affectedOrdersPercent: expressPercent,
          });
        }
      }

      // Carbon offset recommendation
      const providersWithOffsets = alternatives.filter(a => a.carbonOffsetAvailable);
      if (providersWithOffsets.length > 0 && !merchant.shippingOptimization?.requireCarbonOffset) {
        recommendations.push({
          type: 'offset',
          title: 'Enable carbon offset shipping',
          description: `${providersWithOffsets.length} shipping providers offer carbon offset options. This can help neutralize your shipping emissions at minimal additional cost.`,
          estimatedCostSavings: 0,
          estimatedCO2Savings: summary.totalCO2e * 0.9, // Assume 90% offset
          priority: 'medium',
        });
      }

      // Consolidation recommendation (if many small shipments)
      const avgOrderWeight = avgWeight;
      if (avgOrderWeight < 0.5 && summary.totalOrders > 20) {
        recommendations.push({
          type: 'consolidation',
          title: 'Consider order consolidation',
          description: 'Your average order weight is very low. Encouraging customers to consolidate orders or setting minimum order thresholds could reduce per-order shipping costs and emissions.',
          estimatedCostSavings: summary.totalCost * 0.1, // Estimate 10% savings
          estimatedCO2Savings: summary.totalCO2e * 0.1,
          priority: 'low',
        });
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Build top recommendation
    let topRecommendation: ShippingRecommendationsResponse['topRecommendation'];
    if (recommendations.length > 0 && providerBreakdown.length > 0) {
      const topRec = recommendations[0];
      if (topRec.type === 'provider_switch') {
        topRecommendation = {
          fromProvider: providerBreakdown[0].providerName,
          toProvider: topRec.title.replace('Switch to ', ''),
          reason: 'Best overall value based on your cost and carbon preferences',
          impact: `Save $${Math.round(topRec.estimatedCostSavings)} and ${Math.round(topRec.estimatedCO2Savings * 10) / 10}kg CO2e per month`,
        };
      }
    }

    const response: ShippingRecommendationsResponse = {
      summary: {
        potentialCostSavings: Math.round(potentialCostSavings * 100) / 100,
        potentialCO2Reduction: Math.round(potentialCO2Reduction * 1000) / 1000,
        potentialCostSavingsPercent: summary.totalCost > 0
          ? Math.round((potentialCostSavings / summary.totalCost) * 1000) / 10
          : 0,
        potentialCO2ReductionPercent: summary.totalCO2e > 0
          ? Math.round((potentialCO2Reduction / summary.totalCO2e) * 1000) / 10
          : 0,
      },
      recommendations,
      topRecommendation,
    };

    return successResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}
