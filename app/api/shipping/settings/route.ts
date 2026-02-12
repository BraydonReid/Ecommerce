import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

/**
 * GET /api/shipping/settings
 * Returns merchant's shipping optimization settings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');

    if (!shop) {
      return errorResponse('Shop parameter is required', 400);
    }

    // Get merchant
    const merchant = await prisma.merchant.findUnique({
      where: { shopifyShop: shop },
      include: {
        shippingOptimization: true,
      },
    });

    if (!merchant) {
      return errorResponse('Merchant not found', 404);
    }

    // Return settings or defaults
    const settings = merchant.shippingOptimization || {
      costWeight: 50,
      carbonWeight: 50,
      preferredProviderIds: [],
      excludedProviderIds: [],
      maxDeliveryDays: null,
      requireCarbonOffset: false,
    };

    return successResponse({
      settings: {
        costWeight: settings.costWeight,
        carbonWeight: settings.carbonWeight,
        preferredProviderIds: settings.preferredProviderIds,
        excludedProviderIds: settings.excludedProviderIds,
        maxDeliveryDays: settings.maxDeliveryDays,
        requireCarbonOffset: settings.requireCarbonOffset,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/shipping/settings
 * Updates merchant's shipping optimization settings
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');

    if (!shop) {
      return errorResponse('Shop parameter is required', 400);
    }

    const body = await request.json();
    const {
      costWeight,
      carbonWeight,
      preferredProviderIds,
      excludedProviderIds,
      maxDeliveryDays,
      requireCarbonOffset,
    } = body;

    // Validate weights
    if (costWeight !== undefined && (costWeight < 0 || costWeight > 100)) {
      return errorResponse('costWeight must be between 0 and 100', 400);
    }
    if (carbonWeight !== undefined && (carbonWeight < 0 || carbonWeight > 100)) {
      return errorResponse('carbonWeight must be between 0 and 100', 400);
    }

    // Get merchant
    const merchant = await prisma.merchant.findUnique({
      where: { shopifyShop: shop },
    });

    if (!merchant) {
      return errorResponse('Merchant not found', 404);
    }

    // Upsert settings
    const settings = await prisma.shippingOptimizationSettings.upsert({
      where: { merchantId: merchant.id },
      update: {
        ...(costWeight !== undefined && { costWeight }),
        ...(carbonWeight !== undefined && { carbonWeight }),
        ...(preferredProviderIds !== undefined && { preferredProviderIds }),
        ...(excludedProviderIds !== undefined && { excludedProviderIds }),
        ...(maxDeliveryDays !== undefined && { maxDeliveryDays }),
        ...(requireCarbonOffset !== undefined && { requireCarbonOffset }),
      },
      create: {
        merchantId: merchant.id,
        costWeight: costWeight ?? 50,
        carbonWeight: carbonWeight ?? 50,
        preferredProviderIds: preferredProviderIds ?? [],
        excludedProviderIds: excludedProviderIds ?? [],
        maxDeliveryDays: maxDeliveryDays ?? null,
        requireCarbonOffset: requireCarbonOffset ?? false,
      },
    });

    return successResponse({
      settings: {
        costWeight: settings.costWeight,
        carbonWeight: settings.carbonWeight,
        preferredProviderIds: settings.preferredProviderIds,
        excludedProviderIds: settings.excludedProviderIds,
        maxDeliveryDays: settings.maxDeliveryDays,
        requireCarbonOffset: settings.requireCarbonOffset,
      },
    }, 'Settings updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
