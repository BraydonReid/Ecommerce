import { z } from 'zod';

/**
 * Environment variable validation schema
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid URL').optional(),

  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // Shopify
  SHOPIFY_API_KEY: z.string().min(1, 'SHOPIFY_API_KEY is required'),
  SHOPIFY_API_SECRET: z.string().min(1, 'SHOPIFY_API_SECRET is required'),
  SHOPIFY_SCOPES: z.string().default('read_orders,read_products,read_shipping'),
  SHOPIFY_HOST: z.string().url('SHOPIFY_HOST must be a valid URL'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'STRIPE_PUBLISHABLE_KEY must start with pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_').optional(),
  STRIPE_BASIC_PRICE_ID: z.string().startsWith('price_', 'STRIPE_BASIC_PRICE_ID must start with price_').optional(),
  STRIPE_PREMIUM_PRICE_ID: z.string().startsWith('price_', 'STRIPE_PREMIUM_PRICE_ID must start with price_').optional(),

  // Optional: OpenAI for AI insights
  OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY must start with sk-').optional(),

  // Optional: Climatiq for carbon calculations
  CLIMATIQ_API_KEY: z.string().optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables at runtime
 * Throws an error if validation fails
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
        .join('\n');

      throw new Error(
        `Environment validation failed:\n${missingVars}\n\nPlease check your .env file.`
      );
    }
    throw error;
  }
}

/**
 * Safe environment access with validation
 * Only validates in non-test environments
 */
export function getEnv(): Partial<Env> {
  // Skip validation in development to allow gradual setup
  if (process.env.NODE_ENV === 'development') {
    return process.env as unknown as Partial<Env>;
  }

  return validateEnv();
}

/**
 * Check if a specific feature is enabled based on environment
 */
export function isFeatureEnabled(feature: 'ai_insights' | 'climatiq' | 'stripe'): boolean {
  switch (feature) {
    case 'ai_insights':
      return !!process.env.OPENAI_API_KEY;
    case 'climatiq':
      return !!process.env.CLIMATIQ_API_KEY;
    case 'stripe':
      return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PUBLISHABLE_KEY;
    default:
      return false;
  }
}

/**
 * Get required environment variable or throw
 */
export function requireEnv(key: keyof Env): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get optional environment variable with default
 */
export function getEnvOrDefault(key: keyof Env, defaultValue: string): string {
  return process.env[key] || defaultValue;
}
