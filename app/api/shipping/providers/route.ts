import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-utils';

/**
 * GET /api/shipping/providers
 * Returns all available shipping providers with their service levels
 */
export async function GET(request: NextRequest) {
  try {
    const providers = await prisma.shippingProvider.findMany({
      where: { active: true },
      include: {
        serviceLevels: {
          where: { active: true },
          orderBy: { priceMultiplier: 'asc' },
        },
      },
      orderBy: { displayName: 'asc' },
    });

    const formattedProviders = providers.map((provider: any) => ({
      id: provider.id,
      name: provider.name,
      displayName: provider.displayName,
      type: provider.type,
      sustainabilityRating: provider.sustainabilityRating,
      carbonOffsetAvailable: provider.carbonOffsetAvailable,
      avgDeliveryDays: provider.avgDeliveryDays,
      emissionFactors: {
        standard: provider.standardEmissionFactor,
        express: provider.expressEmissionFactor,
        overnight: provider.overnightEmissionFactor,
      },
      serviceLevels: provider.serviceLevels.map((level: any) => ({
        id: level.id,
        name: level.name,
        code: level.code,
        emissionFactor: level.emissionFactor,
        shippingMode: level.shippingMode,
        deliveryDays: level.minDeliveryDays && level.maxDeliveryDays
          ? `${level.minDeliveryDays}-${level.maxDeliveryDays} days`
          : level.maxDeliveryDays
          ? `Up to ${level.maxDeliveryDays} days`
          : 'Varies',
        priceMultiplier: level.priceMultiplier,
      })),
    }));

    return successResponse({ providers: formattedProviders });
  } catch (error) {
    return handleApiError(error);
  }
}
