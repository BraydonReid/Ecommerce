import axios from 'axios';

const CLIMATIQ_API_KEY = process.env.CLIMATIQ_API_KEY;
const CLIMATIQ_BASE_URL = 'https://api.climatiq.io/data/v1';

// Fallback emission factors (kg CO2e per unit) if Climatiq is not available
// Sources:
//   Shipping: GLEC Framework v3.0 (Global Logistics Emissions Council), 2023
//     - Air freight: 1.13 kg CO2e/ton-km (GLEC default, includes RFI)
//     - Sea freight: 0.011 kg CO2e/ton-km (average container vessel)
//     - Road freight: 0.096 kg CO2e/ton-km (average truck, mixed fleet)
//     - Rail freight: 0.028 kg CO2e/ton-km (electric/diesel mix)
//   Packaging: EcoInvent v3.9 / EPA WARM Model
//     - Cardboard: 1.05 kg CO2e/kg (corrugated, virgin + recycled mix)
//     - Plastic: 6.0 kg CO2e/kg (LDPE film, virgin)
//     - Paper: 1.32 kg CO2e/kg (kraft paper, virgin)
//     - Biodegradable: 0.45 kg CO2e/kg (PLA/starch-based, avg)
const EMISSION_FACTORS = {
  shipping: {
    air: 1.13,
    sea: 0.011,
    road: 0.096,
    rail: 0.028,
  },
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

// Country/region coordinates for distance estimation (lat, lng)
// Source: Geographic centroids from Natural Earth / CIA World Factbook
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  'US': [39.8283, -98.5795], 'USA': [39.8283, -98.5795], 'United States': [39.8283, -98.5795],
  'CA': [56.1304, -106.3468], 'Canada': [56.1304, -106.3468],
  'GB': [55.3781, -3.4360], 'UK': [55.3781, -3.4360], 'United Kingdom': [55.3781, -3.4360],
  'DE': [51.1657, 10.4515], 'Germany': [51.1657, 10.4515],
  'FR': [46.2276, 2.2137], 'France': [46.2276, 2.2137],
  'AU': [-25.2744, 133.7751], 'Australia': [-25.2744, 133.7751],
  'JP': [36.2048, 138.2529], 'Japan': [36.2048, 138.2529],
  'CN': [35.8617, 104.1954], 'China': [35.8617, 104.1954],
  'IN': [20.5937, 78.9629], 'India': [20.5937, 78.9629],
  'BR': [-14.235, -51.9253], 'Brazil': [-14.235, -51.9253],
  'MX': [23.6345, -102.5528], 'Mexico': [23.6345, -102.5528],
  'IT': [41.8719, 12.5674], 'Italy': [41.8719, 12.5674],
  'ES': [40.4637, -3.7492], 'Spain': [40.4637, -3.7492],
  'NL': [52.1326, 5.2913], 'Netherlands': [52.1326, 5.2913],
  'SE': [60.1282, 18.6435], 'Sweden': [60.1282, 18.6435],
  'NO': [60.472, 8.4689], 'Norway': [60.472, 8.4689],
  'KR': [35.9078, 127.7669], 'South Korea': [35.9078, 127.7669],
  'NZ': [-40.9006, 174.886], 'New Zealand': [-40.9006, 174.886],
  'SG': [1.3521, 103.8198], 'Singapore': [1.3521, 103.8198],
  'AE': [23.4241, 53.8478], 'United Arab Emirates': [23.4241, 53.8478],
  'ZA': [-30.5595, 22.9375], 'South Africa': [-30.5595, 22.9375],
  'PL': [51.9194, 19.1451], 'Poland': [51.9194, 19.1451],
  'AT': [47.5162, 14.5501], 'Austria': [47.5162, 14.5501],
  'CH': [46.8182, 8.2275], 'Switzerland': [46.8182, 8.2275],
  'BE': [50.5039, 4.4699], 'Belgium': [50.5039, 4.4699],
  'DK': [56.2639, 9.5018], 'Denmark': [56.2639, 9.5018],
  'FI': [61.9241, 25.7482], 'Finland': [61.9241, 25.7482],
  'IE': [53.1424, -7.6921], 'Ireland': [53.1424, -7.6921],
  'PT': [39.3999, -8.2245], 'Portugal': [39.3999, -8.2245],
  'IL': [31.0461, 34.8516], 'Israel': [31.0461, 34.8516],
  'TH': [15.87, 100.9925], 'Thailand': [15.87, 100.9925],
  'PH': [12.8797, 121.774], 'Philippines': [12.8797, 121.774],
  'MY': [4.2105, 101.9758], 'Malaysia': [4.2105, 101.9758],
  'ID': [-0.7893, 113.9213], 'Indonesia': [-0.7893, 113.9213],
  'CO': [4.5709, -74.2973], 'Colombia': [4.5709, -74.2973],
  'AR': [-38.4161, -63.6167], 'Argentina': [-38.4161, -63.6167],
  'CL': [-35.6751, -71.543], 'Chile': [-35.6751, -71.543],
  'NG': [9.082, 8.6753], 'Nigeria': [9.082, 8.6753],
  'EG': [26.8206, 30.8025], 'Egypt': [26.8206, 30.8025],
  'SA': [23.8859, 45.0792], 'Saudi Arabia': [23.8859, 45.0792],
  'TR': [38.9637, 35.2433], 'Turkey': [38.9637, 35.2433],
  'RU': [61.524, 105.3188], 'Russia': [61.524, 105.3188],
  'HK': [22.3193, 114.1694], 'Hong Kong': [22.3193, 114.1694],
  'TW': [23.6978, 120.9605], 'Taiwan': [23.6978, 120.9605],
};

// Major city coordinates for more precise estimates
const CITY_COORDINATES: Record<string, [number, number]> = {
  'new york': [40.7128, -74.006], 'los angeles': [34.0522, -118.2437],
  'chicago': [41.8781, -87.6298], 'houston': [29.7604, -95.3698],
  'phoenix': [33.4484, -112.074], 'philadelphia': [39.9526, -75.1652],
  'san antonio': [29.4241, -98.4936], 'san diego': [32.7157, -117.1611],
  'dallas': [32.7767, -96.797], 'san jose': [37.3382, -121.8863],
  'austin': [30.2672, -97.7431], 'seattle': [47.6062, -122.3321],
  'denver': [39.7392, -104.9903], 'boston': [42.3601, -71.0589],
  'miami': [25.7617, -80.1918], 'atlanta': [33.749, -84.388],
  'portland': [45.5152, -122.6784], 'las vegas': [36.1699, -115.1398],
  'london': [51.5074, -0.1278], 'paris': [48.8566, 2.3522],
  'berlin': [52.52, 13.405], 'tokyo': [35.6762, 139.6503],
  'sydney': [-33.8688, 151.2093], 'melbourne': [-37.8136, 144.9631],
  'toronto': [43.6532, -79.3832], 'vancouver': [49.2827, -123.1207],
  'montreal': [45.5017, -73.5673], 'mumbai': [19.076, 72.8777],
  'shanghai': [31.2304, 121.4737], 'beijing': [39.9042, 116.4074],
  'seoul': [37.5665, 126.978], 'singapore': [1.3521, 103.8198],
  'dubai': [25.2048, 55.2708], 'amsterdam': [52.3676, 4.9041],
  'madrid': [40.4168, -3.7038], 'rome': [41.9028, 12.4964],
  'stockholm': [59.3293, 18.0686], 'dublin': [53.3498, -6.2603],
  'zurich': [47.3769, 8.5417], 'mexico city': [19.4326, -99.1332],
  'sao paulo': [-23.5505, -46.6333], 'buenos aires': [-34.6037, -58.3816],
};

/**
 * Haversine formula to calculate great-circle distance between two points
 * Returns distance in kilometers
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Look up coordinates for a location string (city, country, or address)
 */
function getCoordinates(location: string): [number, number] | null {
  if (!location || location === 'Unknown') return null;

  const lower = location.toLowerCase().trim();

  // Try exact city match first
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (lower.includes(city)) return coords;
  }

  // Try country match - check each part of the address
  const parts = location.split(/[,\s]+/).map(p => p.trim()).filter(Boolean);
  for (const part of parts) {
    if (COUNTRY_COORDINATES[part]) return COUNTRY_COORDINATES[part];
    // Try case-insensitive country name match
    for (const [key, coords] of Object.entries(COUNTRY_COORDINATES)) {
      if (key.toLowerCase() === part.toLowerCase()) return coords;
    }
  }

  return null;
}

/**
 * Estimate shipping distance between two locations using Haversine formula.
 * Applies a 1.3x road routing factor to account for non-straight-line routes.
 * Returns distance in kilometers.
 */
export function estimateShippingDistance(
  origin: string,
  destination: string
): number {
  const originCoords = getCoordinates(origin);
  const destCoords = getCoordinates(destination);

  if (!originCoords || !destCoords) {
    // If we can't resolve either location, use a conservative default
    // based on whether any country info suggests domestic vs international
    const originParts = origin.toLowerCase();
    const destParts = destination.toLowerCase();
    const sameCountry = (
      (originParts.includes('us') && destParts.includes('us')) ||
      (originParts.includes('canada') && destParts.includes('canada')) ||
      (originParts.includes('uk') && destParts.includes('uk'))
    );
    return sameCountry ? 800 : 5000;
  }

  const straightLine = haversineDistance(
    originCoords[0], originCoords[1],
    destCoords[0], destCoords[1]
  );

  // Apply routing factor (roads/shipping are ~1.3x straight-line distance)
  const routingFactor = 1.3;
  return Math.round(straightLine * routingFactor);
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
