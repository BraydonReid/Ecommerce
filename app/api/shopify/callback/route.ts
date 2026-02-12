import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
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

    // Try to find existing merchant in this order:
    // 1. By exact shopifyShop match
    // 2. By currently logged-in session (user connecting their store)
    // 3. By Shopify shop email from API
    // 4. Create new merchant
    let merchant = await prisma.merchant.findUnique({
      where: { shopifyShop: shop },
    });

    if (merchant) {
      // Update existing merchant with access token
      merchant = await prisma.merchant.update({
        where: { id: merchant.id },
        data: { shopifyAccessToken: access_token },
      });
    } else {
      // Check if user is currently logged in — link their account to this shop
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

      if (token?.id) {
        const loggedInMerchant = await prisma.merchant.findUnique({
          where: { id: token.id as string },
        });

        if (loggedInMerchant) {
          // Update logged-in merchant with the new shop domain and access token
          merchant = await prisma.merchant.update({
            where: { id: loggedInMerchant.id },
            data: {
              shopifyShop: shop,
              shopifyAccessToken: access_token,
            },
          });
        }
      }

      if (!merchant) {
        // Try to match by shop owner email from Shopify API
        try {
          const shopResponse = await axios.get(
            `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/shop.json`,
            { headers: { 'X-Shopify-Access-Token': access_token } }
          );
          const shopEmail = shopResponse.data?.shop?.email;

          if (shopEmail) {
            const existingByEmail = await prisma.merchant.findUnique({
              where: { email: shopEmail },
            });

            if (existingByEmail) {
              merchant = await prisma.merchant.update({
                where: { id: existingByEmail.id },
                data: {
                  shopifyShop: shop,
                  shopifyAccessToken: access_token,
                },
              });
            }
          }
        } catch (shopError) {
          console.error('Could not fetch shop info for email matching:', shopError);
        }
      }

      if (!merchant) {
        // Create new merchant as last resort
        merchant = await prisma.merchant.create({
          data: {
            email: `${shop.replace('.myshopify.com', '')}@shopify.merchant`,
            shopifyShop: shop,
            shopifyAccessToken: access_token,
          },
        });
      }
    }

    // Register webhooks
    try {
      await registerWebhooks(shop, access_token);
    } catch (webhookError) {
      console.error('Warning: Failed to register webhooks:', webhookError);
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
