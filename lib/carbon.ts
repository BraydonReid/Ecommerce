import axios from 'axios';

const CLIMATIQ_API_KEY = process.env.CLIMATIQ_API_KEY;
const CLIMATIQ_BASE_URL = 'https://api.climatiq.io/data/v1';

// Fallback emission factors (kg CO2e per unit) if Climatiq is not available
const EMISSION_FACTORS = {
  // Shipping by mode (kg CO2e per ton-km)
  shipping: {
    air: 1.13,
    sea: 0.011,
    road: 0.096,
    rail: 0.028,
  },
  // Packaging (kg CO2e per kg of material)
  packaging: {
    cardboard: 1.05,
    plastic: 6.0,
    paper: 1.32,
    biodegradable: 0.45,
  },
};

export interface CarbonCalculationInput {
  shippingDistance: number; // km
  shippingMethod: 'air' | 'sea' | 'road' | 'rail';
  totalWeight: number; // kg
  packagingWeight: number; // kg
  packagingType: keyof typeof EMISSION_FACTORS.packaging;
}

export interface CarbonCalculationResult {
  totalCO2e: number;
  shippingCO2e: number;
  packagingCO2e: number;
  calculationMethod: string;
}

/**
 * Calculate carbon emissions using Climatiq API
 */
async function calculateWithClimatiq(
  input: CarbonCalculationInput
): Promise<CarbonCalculationResult | null> {
  if (!CLIMATIQ_API_KEY) {
    return null;
  }

  try {
    // Calculate shipping emissions
    const shippingResponse = await axios.post(
      `${CLIMATIQ_BASE_URL}/estimate`,
      {
        emission_factor: {
          activity_id: `freight_vehicle-vehicle_type_${input.shippingMethod}-fuel_source_na-distance_na-weight_na`,
          source: 'GLEC',
          region: 'GLOBAL',
          year: '2023',
        },
        parameters: {
          distance: input.shippingDistance,
          weight: input.totalWeight,
          distance_unit: 'km',
          weight_unit: 'kg',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${CLIMATIQ_API_KEY}`,
        },
      }
    );

    const shippingCO2e = shippingResponse.data.co2e;

    // Calculate packaging emissions (simplified)
    const packagingCO2e =
      input.packagingWeight * EMISSION_FACTORS.packaging[input.packagingType];

    return {
      totalCO2e: shippingCO2e + packagingCO2e,
      shippingCO2e,
      packagingCO2e,
      calculationMethod: 'climatiq',
    };
  } catch (error) {
    console.error('Error calling Climatiq API:', error);
    return null;
  }
}

/**
 * Calculate carbon emissions using fallback factors
 */
function calculateWithFallback(
  input: CarbonCalculationInput
): CarbonCalculationResult {
  // Shipping emissions: distance (km) × weight (kg) × factor / 1000
  // (Convert to ton-km for calculation)
  const tonKm = (input.shippingDistance * input.totalWeight) / 1000;
  const shippingCO2e = tonKm * EMISSION_FACTORS.shipping[input.shippingMethod];

  // Packaging emissions: weight × factor
  const packagingCO2e =
    input.packagingWeight * EMISSION_FACTORS.packaging[input.packagingType];

  return {
    totalCO2e: shippingCO2e + packagingCO2e,
    shippingCO2e,
    packagingCO2e,
    calculationMethod: 'fallback',
  };
}

/**
 * Main function to calculate carbon emissions for an order
 * Tries Climatiq first, falls back to built-in factors
 */
export async function calculateCarbonEmissions(
  input: CarbonCalculationInput
): Promise<CarbonCalculationResult> {
  // Try Climatiq first
  const climatiqResult = await calculateWithClimatiq(input);
  if (climatiqResult) {
    return climatiqResult;
  }

  // Fall back to built-in factors
  return calculateWithFallback(input);
}

/**
 * Estimate shipping distance between two addresses
 * In production, use Google Distance Matrix API or similar
 * For MVP, use simple lat/long distance calculation
 */
export function estimateShippingDistance(
  origin: string,
  destination: string
): number {
  // Simplified: return a default distance
  // In production, integrate with Google Maps Distance Matrix API
  // or use geocoding + Haversine formula

  // For now, return a default based on domestic vs international
  const isDomestic = origin.includes('USA') && destination.includes('USA');
  return isDomestic ? 1500 : 8000; // km
}

/**
 * Determine shipping method from shipping line data
 */
export function determineShippingMethod(
  shippingTitle: string
): 'air' | 'sea' | 'road' | 'rail' {
  const lower = shippingTitle.toLowerCase();

  if (lower.includes('air') || lower.includes('express') || lower.includes('overnight')) {
    return 'air';
  } else if (lower.includes('sea') || lower.includes('ocean') || lower.includes('freight')) {
    return 'sea';
  } else if (lower.includes('rail') || lower.includes('train')) {
    return 'rail';
  } else {
    return 'road'; // Default to road
  }
}
