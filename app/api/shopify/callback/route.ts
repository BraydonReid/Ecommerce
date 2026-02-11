import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

// Use environment variable for API version with fallback
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01';

/**
 * Handle Shopify OAuth callback
 * GET /api/shopify/callback?code=...&shop=...
 */
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const shop = request.nextUrl.searchParams.get('shop');
    const hmac = request.nextUrl.searchParams.get('hmac');

    if (!code || !shop) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return NextResponse.json(
        { error: 'Failed to get access token' },
        { status: 400 }
      );
    }

    // Store or update merchant in database
    const merchant = await prisma.merchant.upsert({
      where: { shopifyShop: shop },
      update: {
        shopifyAccessToken: access_token,
      },
      create: {
        email: `${shop}@shopify.merchant`,
        shopifyShop: shop,
        shopifyAccessToken: access_token,
      },
    });

    // Log successful connection (consider using a proper logging service in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Merchant connected:', shop);
    }

    // Register webhooks
    try {
      await registerWebhooks(shop, access_token);
    } catch (webhookError) {
      console.error('Warning: Failed to register webhooks:', webhookError);
      // Continue anyway - webhooks can be set up later
    }

    // Redirect to dashboard with shop parameter
    return NextResponse.redirect(new URL(`/dashboard?success=true&shop=${encodeURIComponent(shop)}`, request.url));
  } catch (error) {
    console.error('Error in Shopify callback:', error);
    return NextResponse.json(
      { error: 'OAuth callback failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Register webhooks for the shop
 */
async function registerWebhooks(shop: string, accessToken: string) {
  const webhooks = [
    {
      topic: 'orders/create',
      address: `${process.env.SHOPIFY_HOST}/api/webhooks/shopify/orders-create`,
    },
    {
      topic: 'orders/updated',
      address: `${process.env.SHOPIFY_HOST}/api/webhooks/shopify/orders-updated`,
    },
  ];

  for (const webhook of webhooks) {
    try {
      await axios.post(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`,
        {
          webhook: {
            topic: webhook.topic,
            address: webhook.address,
            format: 'json',
          },
        },
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      );
      if (process.env.NODE_ENV === 'development') {
        console.log(`Registered webhook: ${webhook.topic}`);
      }
    } catch (error) {
      // Log webhook registration errors but don't throw - webhook can be retried
      console.error(`Failed to register webhook ${webhook.topic}:`, error);
    }
  }
}
