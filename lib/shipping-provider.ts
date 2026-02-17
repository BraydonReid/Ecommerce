import { prisma } from './prisma';
import { DetectedProvider, ShippingMode, CompareAlternative, ShippingOptimizationSettings } from '@/types';

// Provider detection patterns
const PROVIDER_PATTERNS: Record<string, string[]> = {
  ups: ['ups', 'united parcel', 'u.p.s', 'united parcel service'],
  fedex: ['fedex', 'federal express', 'fed ex', 'fed-ex'],
  usps: ['usps', 'postal service', 'priority mail', 'first class', 'media mail', 'parcel select'],
  dhl: ['dhl', 'deutsche post', 'dhl express', 'dhl ecommerce'],
};

// Service level patterns
const SERVICE_PATTERNS: Record<string, string[]> = {
  overnight: ['overnight', 'next day', '1-day', 'one day', 'express saver', 'priority overnight', 'next business day'],
  express: ['express', '2-day', 'two day', '2nd day', 'second day', 'priority', '2day', '3-day', 'three day'],
  ground: ['ground', 'standard', 'economy', 'parcel', 'smartpost', 'surepost', 'basic', 'deferred'],
};

// Default emission factors by service level (kg CO2e per ton-km)
// Source: GLEC Framework v3.0 (Global Logistics Emissions Council)
const DEFAULT_EMISSION_FACTORS = {
  overnight: 1.13,  // Air freight (GLEC default, includes radiative forcing index)
  express: 0.15,    // Express (GLEC weighted average of air + road)
  ground: 0.096,    // Ground/road freight (GLEC average truck, mixed fleet)
};

/**
 * Detect shipping provider from Shopify shipping line data
 */
export function detectShippingProvider(
  title: string,
  code: string
): DetectedProvider {
  const searchText = `${title} ${code}`.toLowerCase();

  let matchedProvider: string | null = null;
  let matchedProviderName = 'Unknown';
  let confidence = 0;

  // Detect provider
  for (const [provider, patterns] of Object.entries(PROVIDER_PATTERNS)) {
    for (const pattern of patterns) {
      if (searchText.includes(pattern)) {
        matchedProvider = provider;
        matchedProviderName = provider.toUpperCase();
        confidence = Math.max(confidence, pattern.length / searchText.length * 100);
        break;
      }
    }
    if (matchedProvider) break;
  }

  // Detect service level
  let serviceLevel = 'ground';
  let shippingMode: ShippingMode = 'road';
  let emissionFactor = DEFAULT_EMISSION_FACTORS.ground;

  for (const [level, patterns] of Object.entries(SERVICE_PATTERNS)) {
    for (const pattern of patterns) {
      if (searchText.includes(pattern)) {
        serviceLevel = level;
        if (level === 'overnight') {
          shippingMode = 'air';
          emissionFactor = DEFAULT_EMISSION_FACTORS.overnight;
        } else if (level === 'express') {
          shippingMode = 'road';
          emissionFactor = DEFAULT_EMISSION_FACTORS.express;
        }
        break;
      }
    }
    if (serviceLevel !== 'ground') break;
  }

  // Calculate confidence
  const finalConfidence = matchedProvider ? Math.min(confidence + 50, 100) : 20;

  return {
    providerId: null, // Will be matched to database later
    providerName: matchedProviderName,
    serviceLevel,
    confidence: Math.round(finalConfidence),
    emissionFactor,
    shippingMode,
  };
}

/**
 * Match detected provider to database provider
 */
export async function matchProviderToDatabase(
  detected: DetectedProvider
): Promise<DetectedProvider> {
  if (detected.providerName === 'Unknown') {
    return detected;
  }

  try {
    const provider = await prisma.shippingProvider.findFirst({
      where: {
        name: detected.providerName.toLowerCase(),
        active: true,
      },
      include: {
        serviceLevels: {
          where: { active: true },
        },
      },
    });

    if (provider) {
      // Find matching service level
      const serviceLevel = provider.serviceLevels.find((sl: any) =>
        sl.name.toLowerCase().includes(detected.serviceLevel)
      );

      return {
        ...detected,
        providerId: provider.id,
        emissionFactor: serviceLevel?.emissionFactor ?? detected.emissionFactor,
        shippingMode: (serviceLevel?.shippingMode as ShippingMode) ?? detected.shippingMode,
      };
    }
  } catch (error) {
    console.error('Error matching provider to database:', error);
  }

  return detected;
}

/**
 * Calculate shipping emissions using provider-specific factors
 */
export function calculateProviderEmissions(
  emissionFactor: number,
  weight: number,
  distance: number
): number {
  // Shipping emissions: distance (km) × weight (kg) × factor / 1000
  // (Convert to ton-km for calculation)
  const tonKm = (distance * weight) / 1000;
  return tonKm * emissionFactor;
}

/**
 * Estimate shipping cost based on provider-specific base rates from the database.
 * Uses weight + distance pricing model with service-level multipliers.
 * Actual costs come from Shopify order data; this is used for comparison alternatives.
 */
export function estimateShippingCost(
  weight: number,
  distance: number,
  serviceLevel: string,
  basePricePerKg?: number,
  basePricePerKm?: number,
  minimumCharge?: number,
  priceMultiplier: number = 1.0
): number {
  // Default pricing model (simplified)
  const defaultPricePerKg = basePricePerKg ?? 0.5;
  const defaultPricePerKm = basePricePerKm ?? 0.01;
  const defaultMinimum = minimumCharge ?? 5.0;

  // Service level multipliers
  const serviceMultipliers: Record<string, number> = {
    overnight: 3.0,
    express: 1.8,
    ground: 1.0,
  };

  const levelMultiplier = serviceMultipliers[serviceLevel] ?? 1.0;

  // Calculate base cost
  const weightCost = weight * defaultPricePerKg;
  const distanceCost = (distance / 100) * defaultPricePerKm; // Per 100km
  const baseCost = weightCost + distanceCost;

  // Apply multipliers
  const totalCost = baseCost * levelMultiplier * priceMultiplier;

  return Math.max(totalCost, defaultMinimum);
}

/**
 * Generate comparison alternatives for shipping optimization
 */
export async function generateComparisons(
  currentCost: number,
  currentCO2e: number,
  weight: number,
  distance: number,
  preferences?: ShippingOptimizationSettings | null
): Promise<CompareAlternative[]> {
  try {
    // Fetch all active providers with service levels
    const providers = await prisma.shippingProvider.findMany({
      where: {
        active: true,
        ...(preferences?.excludedProviderIds?.length ? {
          id: { notIn: preferences.excludedProviderIds },
        } : {}),
      },
      include: {
        serviceLevels: {
          where: { active: true },
        },
      },
    });

    const alternatives: CompareAlternative[] = [];

    for (const provider of providers) {
      for (const level of provider.serviceLevels) {
        // Check delivery constraint
        if (preferences?.maxDeliveryDays && level.maxDeliveryDays) {
          if (level.maxDeliveryDays > preferences.maxDeliveryDays) {
            continue;
          }
        }

        // Check carbon offset requirement
        if (preferences?.requireCarbonOffset && !provider.carbonOffsetAvailable) {
          continue;
        }

        // Calculate estimates
        const estimatedCO2e = calculateProviderEmissions(
          level.emissionFactor,
          weight,
          distance
        );

        const estimatedCost = estimateShippingCost(
          weight,
          distance,
          level.name.toLowerCase(),
          provider.basePricePerKg ?? undefined,
          provider.basePricePerKm ?? undefined,
          provider.minimumCharge ?? undefined,
          level.priceMultiplier
        );

        // Calculate savings
        const costSavings = currentCost - estimatedCost;
        const co2Savings = currentCO2e - estimatedCO2e;
        const costSavingsPercent = currentCost > 0 ? (costSavings / currentCost) * 100 : 0;
        const co2SavingsPercent = currentCO2e > 0 ? (co2Savings / currentCO2e) * 100 : 0;

        // Calculate recommendation score
        const costWeight = preferences?.costWeight ?? 50;
        const carbonWeight = preferences?.carbonWeight ?? 50;
        const totalWeight = costWeight + carbonWeight;

        const normalizedCostScore = costSavingsPercent > 0 ? Math.min(costSavingsPercent, 100) : 0;
        const normalizedCO2Score = co2SavingsPercent > 0 ? Math.min(co2SavingsPercent, 100) : 0;

        const recommendationScore = totalWeight > 0
          ? (normalizedCostScore * costWeight + normalizedCO2Score * carbonWeight) / totalWeight
          : (normalizedCostScore + normalizedCO2Score) / 2;

        // Calculate delivery days
        const deliveryDays = level.maxDeliveryDays ?? level.minDeliveryDays ?? provider.avgDeliveryDays ?? 5;

        alternatives.push({
          providerId: provider.id,
          providerName: provider.displayName,
          serviceLevel: level.name,
          estimatedCost: Math.round(estimatedCost * 100) / 100,
          estimatedCO2e: Math.round(estimatedCO2e * 1000) / 1000,
          deliveryDays,
          costSavings: Math.round(costSavings * 100) / 100,
          costSavingsPercent: Math.round(costSavingsPercent * 10) / 10,
          co2Savings: Math.round(co2Savings * 1000) / 1000,
          co2SavingsPercent: Math.round(co2SavingsPercent * 10) / 10,
          recommendationScore: Math.round(recommendationScore * 10) / 10,
          sustainabilityRating: provider.sustainabilityRating ?? undefined,
          carbonOffsetAvailable: provider.carbonOffsetAvailable,
        });
      }
    }

    // Sort by recommendation score descending
    alternatives.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return alternatives;
  } catch (error) {
    console.error('Error generating comparisons:', error);
    return [];
  }
}

/**
 * Get the best shipping alternatives based on different criteria
 */
export function getBestAlternatives(alternatives: CompareAlternative[]) {
  if (alternatives.length === 0) {
    return {
      bestForCost: null,
      bestForCarbon: null,
      bestOverall: null,
    };
  }

  // Best for cost (highest positive cost savings)
  const bestForCost = alternatives.reduce((best, curr) =>
    curr.costSavings > (best?.costSavings ?? -Infinity) ? curr : best
  , alternatives[0]);

  // Best for carbon (highest positive CO2 savings)
  const bestForCarbon = alternatives.reduce((best, curr) =>
    curr.co2Savings > (best?.co2Savings ?? -Infinity) ? curr : best
  , alternatives[0]);

  // Best overall (highest recommendation score)
  const bestOverall = alternatives[0]; // Already sorted by score

  return {
    bestForCost: bestForCost.costSavings > 0 ? `${bestForCost.providerName} ${bestForCost.serviceLevel}` : null,
    bestForCarbon: bestForCarbon.co2Savings > 0 ? `${bestForCarbon.providerName} ${bestForCarbon.serviceLevel}` : null,
    bestOverall: bestOverall.recommendationScore > 0 ? `${bestOverall.providerName} ${bestOverall.serviceLevel}` : null,
  };
}

/**
 * Aggregate shipping costs for a merchant over a period
 */
export async function aggregateShippingCosts(
  merchantId: string,
  startDate?: Date,
  endDate?: Date
) {
  const whereClause: any = { merchantId };

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = startDate;
    if (endDate) whereClause.createdAt.lte = endDate;
  }

  try {
    const records = await prisma.orderShippingRecord.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            emissions: true,
          },
        },
      },
    });

    if (records.length === 0) {
      return {
        totalCost: 0,
        totalOrders: 0,
        avgCostPerOrder: 0,
        avgCostPerKg: 0,
        totalCO2e: 0,
        avgCO2ePerOrder: 0,
        carbonPerDollar: 0,
      };
    }

    const totalCost = records.reduce((sum: number, r: any) => sum + r.shippingCost, 0);
    const totalOrders = records.length;
    const totalWeight = records.reduce((sum: number, r: any) => sum + (r.order.totalWeight ?? 0), 0);
    const totalCO2e = records.reduce((sum: number, r: any) => {
      const emission = r.order.emissions[0];
      return sum + (emission?.shippingCO2e ?? 0);
    }, 0);

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      totalOrders,
      avgCostPerOrder: Math.round((totalCost / totalOrders) * 100) / 100,
      avgCostPerKg: totalWeight > 0 ? Math.round((totalCost / totalWeight) * 100) / 100 : 0,
      totalCO2e: Math.round(totalCO2e * 1000) / 1000,
      avgCO2ePerOrder: Math.round((totalCO2e / totalOrders) * 1000) / 1000,
      carbonPerDollar: totalCost > 0 ? Math.round((totalCO2e / totalCost) * 1000) / 1000 : 0,
    };
  } catch (error) {
    console.error('Error aggregating shipping costs:', error);
    throw error;
  }
}

/**
 * Get provider breakdown for a merchant's orders
 */
export async function getProviderBreakdown(
  merchantId: string,
  startDate?: Date,
  endDate?: Date
) {
  const whereClause: any = { merchantId };

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = startDate;
    if (endDate) whereClause.createdAt.lte = endDate;
  }

  try {
    const records = await prisma.orderShippingRecord.findMany({
      where: whereClause,
      include: {
        matchedProvider: true,
        order: {
          include: {
            emissions: true,
          },
        },
      },
    });

    const totalOrders = records.length;
    if (totalOrders === 0) return [];

    // Group by provider
    const byProvider = new Map<string, {
      providerName: string;
      providerId?: string;
      orderCount: number;
      totalCost: number;
      totalCO2e: number;
    }>();

    for (const record of records) {
      const providerName = record.matchedProvider?.displayName ?? record.detectedProviderName ?? 'Unknown';
      const providerId = record.matchedProviderId ?? undefined;

      const existing = byProvider.get(providerName) ?? {
        providerName,
        providerId,
        orderCount: 0,
        totalCost: 0,
        totalCO2e: 0,
      };

      existing.orderCount += 1;
      existing.totalCost += record.shippingCost;
      existing.totalCO2e += record.order.emissions[0]?.shippingCO2e ?? 0;

      byProvider.set(providerName, existing);
    }

    // Convert to array and add derived metrics
    return Array.from(byProvider.values()).map(p => ({
      ...p,
      avgCostPerOrder: Math.round((p.totalCost / p.orderCount) * 100) / 100,
      percentOfOrders: Math.round((p.orderCount / totalOrders) * 1000) / 10,
      totalCost: Math.round(p.totalCost * 100) / 100,
      totalCO2e: Math.round(p.totalCO2e * 1000) / 1000,
    })).sort((a, b) => b.orderCount - a.orderCount);
  } catch (error) {
    console.error('Error getting provider breakdown:', error);
    throw error;
  }
}
