import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import shopify from '@/lib/shopify';

/**
 * Handle Shopify app/uninstalled webhook
 * Clears the access token and deactivates the merchant.
 * Full data deletion happens via shop/redact 48 hours later.
 */
export async function POST(request: NextRequest) {
  try {
    const topic = request.headers.get('X-Shopify-Topic');
    const shop = request.headers.get('X-Shopify-Shop-Domain');
    const rawBody = await request.text();

    // Verify HMAC
    const isValid = await shopify.webhooks.validate({
      rawBody,
      rawRequest: request as any,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const shopDomain = shop || payload.myshopify_domain;

    if (shopDomain) {
      const merchant = await prisma.merchant.findUnique({
        where: { shopifyShop: shopDomain },
      });

      if (merchant) {
        // Revoke access — clear token and deactivate
        await prisma.merchant.update({
          where: { id: merchant.id },
          data: {
            shopifyAccessToken: null,
            active: false,
          },
        });
      }
    }

    await prisma.webhookLog.create({
      data: {
        source: 'shopify',
        event: topic || 'app/uninstalled',
        payload: {
          shop_domain: shopDomain,
          deactivated: true,
        },
        processed: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing app/uninstalled webhook:', error);

    try {
      await prisma.webhookLog.create({
        data: {
          source: 'shopify',
          event: 'app/uninstalled',
          payload: {},
          processed: false,
          error: String(error),
        },
      });
    } catch {}

    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
