/**
 * Environment variable validation
 * This module validates required environment variables at startup
 */

interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
}

const envVariables: EnvVariable[] = [
  // Database
  { name: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string' },

  // NextAuth
  { name: 'NEXTAUTH_URL', required: true, description: 'Application URL for NextAuth' },
  { name: 'NEXTAUTH_SECRET', required: true, description: 'Secret for JWT encryption' },

  // Shopify
  { name: 'SHOPIFY_API_KEY', required: true, description: 'Shopify API key' },
  { name: 'SHOPIFY_API_SECRET', required: true, description: 'Shopify API secret' },
  { name: 'SHOPIFY_HOST', required: true, description: 'App host URL for Shopify callbacks' },

  // Stripe (optional in dev, required in prod)
  { name: 'STRIPE_SECRET_KEY', required: process.env.NODE_ENV === 'production', description: 'Stripe secret key' },
  { name: 'STRIPE_WEBHOOK_SECRET', required: process.env.NODE_ENV === 'production', description: 'Stripe webhook secret' },

  // Optional services
  { name: 'OPENAI_API_KEY', required: false, description: 'OpenAI API key for AI insights' },
  { name: 'CLIMATIQ_API_KEY', required: false, description: 'Climatiq API key for carbon calculations' },
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const envVar of envVariables) {
    const value = process.env[envVar.name];

    if (!value || value.trim() === '') {
      if (envVar.required) {
        errors.push(`Missing required environment variable: ${envVar.name} (${envVar.description})`);
      } else {
        warnings.push(`Missing optional environment variable: ${envVar.name} (${envVar.description})`);
      }
    }
  }

  // Additional validation
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    errors.push('NEXTAUTH_SECRET should be at least 32 characters for security');
  }

  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXTAUTH_URL?.includes('localhost')) {
      errors.push('NEXTAUTH_URL should not contain localhost in production');
    }

    if (process.env.DATABASE_URL?.includes('localhost')) {
      warnings.push('DATABASE_URL contains localhost - ensure this is correct for production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function logEnvironmentStatus(): void {
  const result = validateEnvironment();

  if (result.errors.length > 0) {
    console.error('\n❌ Environment validation failed:');
    result.errors.forEach((error) => console.error(`   - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Environment warnings:');
    result.warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  if (result.valid && result.warnings.length === 0) {
    console.log('\n✅ Environment validation passed');
  }
}

// Export for use in API routes that need to check env vars
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

export function getOptionalEnv(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}
