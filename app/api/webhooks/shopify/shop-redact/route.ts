import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import shopify from '@/lib/shopify';

/**
 * Handle Shopify shop/redact webhook (GDPR mandatory)
 * Shopify sends this 48 hours after an app is uninstalled.
 * We must delete all data associated with the shop.
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
    const shopDomain = payload.shop_domain || shop;

    if (shopDomain) {
      const merchant = await prisma.merchant.findUnique({
        where: { shopifyShop: shopDomain },
      });

      if (merchant) {
        // Delete the merchant record — all related data cascades automatically
        // (orders, emissions, products, settings, shipping records, etc.)
        await prisma.merchant.delete({
          where: { id: merchant.id },
        });
      }
    }

    // Log the redact event (outside merchant scope since merchant is deleted)
    await prisma.webhookLog.create({
      data: {
        source: 'shopify',
        event: topic || 'shop/redact',
        payload: {
          shop_domain: shopDomain,
          shop_id: payload.shop_id,
          redacted: true,
        },
        processed: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing shop/redact webhook:', error);

    try {
      await prisma.webhookLog.create({
        data: {
          source: 'shopify',
          event: 'shop/redact',
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
