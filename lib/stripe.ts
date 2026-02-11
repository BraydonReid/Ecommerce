import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
} as const;

export const TIER_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    maxOrders: 100,
    aiInsights: false,
    pdfReports: false,
  },
  [SUBSCRIPTION_TIERS.BASIC]: {
    maxOrders: 2000,
    aiInsights: false,
    pdfReports: true,
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    maxOrders: Infinity,
    aiInsights: true,
    pdfReports: true,
  },
};

/**
 * Create a Stripe customer for a merchant
 */
export async function createStripeCustomer(email: string, merchantId: string) {
  return await stripe.customers.create({
    email,
    metadata: {
      merchantId,
    },
  });
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  merchantId: string
) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
    metadata: {
      merchantId,
    },
  });
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(customerId: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  });
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}
