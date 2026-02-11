import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

/**
 * Handle Stripe webhooks
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const merchantId = session.metadata?.merchantId;

        if (!merchantId) {
          console.error('No merchantId in session metadata');
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Determine tier from price ID
        let tier = 'basic';
        if (session.line_items?.data[0]?.price?.id === process.env.STRIPE_PREMIUM_PRICE_ID) {
          tier = 'premium';
        }

        // Update merchant with subscription info
        await prisma.merchant.update({
          where: { id: merchantId },
          data: {
            stripeCustomerId: session.customer as string,
            subscriptionId: subscription.id,
            subscriptionTier: tier,
          },
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find merchant by customer ID
        const merchant = await prisma.merchant.findUnique({
          where: { stripeCustomerId: subscription.customer as string },
        });

        if (!merchant) {
          console.error('Merchant not found for customer:', subscription.customer);
          break;
        }

        // Update subscription status
        await prisma.merchant.update({
          where: { id: merchant.id },
          data: {
            active: subscription.status === 'active',
          },
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const merchant = await prisma.merchant.findUnique({
          where: { stripeCustomerId: subscription.customer as string },
        });

        if (!merchant) {
          console.error('Merchant not found for customer:', subscription.customer);
          break;
        }

        // Downgrade to free tier
        await prisma.merchant.update({
          where: { id: merchant.id },
          data: {
            subscriptionTier: 'free',
            subscriptionId: null,
            active: true,
          },
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
