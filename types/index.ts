// User and Authentication Types
export interface User {
  id: string;
  email: string;
  subscriptionTier: SubscriptionTier;
}

export type SubscriptionTier = 'free' | 'basic' | 'premium';

// Merchant Types
export interface Merchant {
  id: string;
  email: string;
  shopifyShop: string | null;
  shopifyAccessToken: string | null;
  subscriptionTier: SubscriptionTier;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantSettings {
  id: string;
  merchantId: string;
  defaultPackagingType: PackagingType;
  defaultShippingMode: ShippingMode;
  trackingEnabled: boolean;
  emailNotifications: boolean;
  weeklyReports: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  id: string;
  merchantId: string;
  shopifyProductId: string;
  title: string;
  productType: string | null;
  vendor: string | null;
  weight: number | null;
  weightUnit: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface Order {
  id: string;
  merchantId: string;
  shopifyOrderId: string;
  orderNumber: string;
  totalPrice: number;
  currency: string;
  shippingCountry: string | null;
  shippingCity: string | null;
  shippingMethod: string | null;
  fulfillmentStatus: string | null;
  createdAt: Date;
  processedAt: Date | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  shopifyLineItemId: string;
  title: string;
  quantity: number;
  price: number;
  weight: number | null;
}

// Emission Types
export interface EmissionRecord {
  id: string;
  merchantId: string;
  orderId: string;
  totalCO2e: number;
  shippingCO2e: number;
  packagingCO2e: number;
  shippingMode: ShippingMode | null;
  packagingType: PackagingType | null;
  distance: number | null;
  calculatedAt: Date;
}

export type ShippingMode = 'air' | 'sea' | 'road' | 'rail';
export type PackagingType = 'cardboard' | 'plastic' | 'paper' | 'biodegradable' | 'mixed';

// AI Insight Types
export interface AIInsight {
  id: string;
  merchantId: string;
  period: string;
  summary: string;
  recommendations: string;
  rawResponse: string | null;
  createdAt: Date;
}

// Webhook Types
export interface WebhookLog {
  id: string;
  merchantId: string | null;
  topic: string;
  shopifyWebhookId: string | null;
  payload: any;
  status: WebhookStatus;
  errorMessage: string | null;
  processedAt: Date | null;
  createdAt: Date;
}

export type WebhookStatus = 'received' | 'processing' | 'completed' | 'failed';

// Dashboard Types
export interface DashboardData {
  merchant: {
    id: string;
    email: string;
    shopifyShop: string | null;
    subscriptionTier: SubscriptionTier;
  };
  summary: EmissionSummary;
  recentOrders: OrderWithEmissions[];
  topProducts: ProductEmissionSummary[];
  chartData: ChartDataPoint[];
}

export interface EmissionSummary {
  totalOrders: number;
  totalEmissions: number;
  shippingEmissions: number;
  packagingEmissions: number;
  avgEmissionsPerOrder?: number;
}

export interface OrderWithEmissions extends Order {
  emissions: EmissionRecord | null;
  items: OrderItem[];
}

export interface ProductEmissionSummary {
  id: string;
  title: string;
  orderCount: number;
  totalEmissions: number;
}

export interface ChartDataPoint {
  date: Date | string;
  total: number;
  shipping: number;
  packaging: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  shopName?: string;
}

export interface SettingsFormData {
  defaultPackagingType: PackagingType;
  defaultShippingMode: ShippingMode;
  trackingEnabled: boolean;
  emailNotifications: boolean;
  weeklyReports: boolean;
}

// Carbon Calculation Types
export interface CarbonCalculationInput {
  weight: number;
  distance: number;
  shippingMode: ShippingMode;
  packagingType: PackagingType;
}

export interface CarbonCalculationResult {
  totalCO2e: number;
  shippingCO2e: number;
  packagingCO2e: number;
  breakdown: {
    shipping: {
      mode: ShippingMode;
      distance: number;
      weight: number;
      emissions: number;
    };
    packaging: {
      type: PackagingType;
      weight: number;
      emissions: number;
    };
  };
}

// Report Types
export interface ReportData {
  merchant: {
    name: string;
  };
  period: {
    start: Date;
    end: Date;
  };
  summary: EmissionSummary;
}

// Shopify Types
export interface ShopifyOrder {
  id: number;
  order_number: number;
  total_price: string;
  currency: string;
  created_at: string;
  processed_at: string | null;
  fulfillment_status: string | null;
  shipping_address?: {
    country: string;
    city: string;
  };
  shipping_lines?: Array<{
    title: string;
    code: string;
  }>;
  line_items: ShopifyLineItem[];
}

export interface ShopifyLineItem {
  id: number;
  title: string;
  quantity: number;
  price: string;
  grams: number;
  product_id: number | null;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  product_type: string;
  vendor: string;
  variants: Array<{
    id: number;
    weight: number;
    weight_unit: string;
  }>;
}

// Stripe Types
export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface StripeBillingPortal {
  url: string;
}

// Next Auth Types Extension
declare module 'next-auth' {
  interface Session {
    user: User & {
      id: string;
      subscriptionTier: SubscriptionTier;
      isAdmin: boolean;
      shopifyShop?: string | null;
    };
  }

  interface User {
    id: string;
    subscriptionTier: SubscriptionTier;
    isAdmin: boolean;
    shopifyShop?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    subscriptionTier: SubscriptionTier;
    isAdmin: boolean;
    shopifyShop?: string | null;
  }
}

// Shipping Optimization Types

export interface ShippingProvider {
  id: string;
  name: string;
  displayName: string;
  type: string;
  standardEmissionFactor: number;
  expressEmissionFactor: number;
  overnightEmissionFactor: number;
  basePricePerKg?: number;
  basePricePerKm?: number;
  minimumCharge?: number;
  avgDeliveryDays?: number;
  carbonOffsetAvailable: boolean;
  sustainabilityRating?: number;
  active: boolean;
  serviceLevels?: ShippingServiceLevel[];
}

export interface ShippingServiceLevel {
  id: string;
  providerId: string;
  name: string;
  code: string;
  emissionFactor: number;
  shippingMode: ShippingMode;
  priceMultiplier: number;
  minDeliveryDays?: number;
  maxDeliveryDays?: number;
  active: boolean;
}

export interface OrderShippingRecord {
  id: string;
  orderId: string;
  merchantId: string;
  detectedProviderName?: string;
  detectedServiceLevel?: string;
  matchedProviderId?: string;
  shippingCost: number;
  shippingCurrency: string;
  carrierCode?: string;
  carrierTitle?: string;
  costPerKg?: number;
  costPerKm?: number;
  carbonPerDollar?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingComparison {
  id: string;
  merchantId: string;
  orderShippingRecordId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  currentCost: number;
  currentCO2e: number;
  alternativeProviderId: string;
  estimatedCost: number;
  estimatedCO2e: number;
  costSavings: number;
  co2Savings: number;
  costSavingsPercent: number;
  co2SavingsPercent: number;
  recommendationScore: number;
  createdAt: Date;
}

export interface ShippingOptimizationSettings {
  id: string;
  merchantId: string;
  costWeight: number;
  carbonWeight: number;
  preferredProviderIds: string[];
  excludedProviderIds: string[];
  maxDeliveryDays?: number | null;
  requireCarbonOffset: boolean;
}

export interface ShippingCostsSummary {
  totalCost: number;
  totalOrders: number;
  avgCostPerOrder: number;
  avgCostPerKg: number;
  totalCO2e: number;
  avgCO2ePerOrder: number;
  carbonPerDollar: number;
}

export interface ProviderBreakdown {
  providerName: string;
  providerId?: string;
  orderCount: number;
  totalCost: number;
  totalCO2e: number;
  avgCostPerOrder: number;
  percentOfOrders: number;
}

export interface ShippingCostsResponse {
  summary: ShippingCostsSummary;
  byProvider: ProviderBreakdown[];
  byServiceLevel: {
    serviceLevel: string;
    orderCount: number;
    totalCost: number;
    totalCO2e: number;
  }[];
  trend: {
    date: string;
    cost: number;
    orders: number;
    co2e: number;
  }[];
}

export interface DetectedProvider {
  providerId: string | null;
  providerName: string;
  serviceLevel: string;
  confidence: number;
  emissionFactor: number;
  shippingMode: ShippingMode;
}

export interface CompareRequest {
  merchantId: string;
  orderId?: string;
  periodStart?: string;
  periodEnd?: string;
  weight?: number;
  distance?: number;
}

export interface CompareAlternative {
  providerId: string;
  providerName: string;
  serviceLevel: string;
  estimatedCost: number;
  estimatedCO2e: number;
  deliveryDays: number;
  costSavings: number;
  costSavingsPercent: number;
  co2Savings: number;
  co2SavingsPercent: number;
  recommendationScore: number;
  sustainabilityRating?: number;
  carbonOffsetAvailable: boolean;
}

export interface CompareResponse {
  currentProvider: {
    name: string;
    cost: number;
    co2e: number;
    deliveryDays?: number;
  };
  alternatives: CompareAlternative[];
  recommendation: {
    bestForCost: string;
    bestForCarbon: string;
    bestOverall: string;
  };
}

export interface ShippingRecommendation {
  type: 'provider_switch' | 'service_downgrade' | 'consolidation' | 'offset';
  title: string;
  description: string;
  estimatedCostSavings: number;
  estimatedCO2Savings: number;
  priority: 'high' | 'medium' | 'low';
  affectedOrdersPercent?: number;
}

export interface ShippingRecommendationsResponse {
  summary: {
    potentialCostSavings: number;
    potentialCO2Reduction: number;
    potentialCostSavingsPercent: number;
    potentialCO2ReductionPercent: number;
  };
  recommendations: ShippingRecommendation[];
  topRecommendation?: {
    fromProvider: string;
    toProvider: string;
    reason: string;
    impact: string;
  };
}

export interface ShippingOptimizationSummary {
  enabled: boolean;
  totalShippingCost: number;
  potentialSavings: number;
  potentialCO2Reduction: number;
  topRecommendation?: string;
}
