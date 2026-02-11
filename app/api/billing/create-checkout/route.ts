import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession, createStripeCustomer } from '@/lib/stripe';

/**
 * Create a Stripe checkout session
 * POST /api/billing/create-checkout
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const merchantId = (session.user as any).id;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { priceId } = body;

  // Validate priceId
  if (!priceId || typeof priceId !== 'string' || !priceId.startsWith('price_')) {
    return NextResponse.json(
      {
        error: 'Invalid or missing price ID. Please configure NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID and NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID in your .env file with valid Stripe price IDs from your dashboard.'
      },
      { status: 400 }
    );
  }

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    // Create Stripe customer if doesn't exist
    let customerId = merchant.stripeCustomerId;
    if (!customerId) {
      const customer = await createStripeCustomer(merchant.email, merchantId);
      customerId = customer.id;

      await prisma.merchant.update({
        where: { id: merchantId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession(
      customerId,
      priceId,
      merchantId
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
