import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import shopify from '@/lib/shopify';

/**
 * Handle Shopify customers/redact webhook (GDPR mandatory)
 * Shopify sends this when a customer requests deletion of their data.
 * We must redact all PII associated with the customer.
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
    const ordersToRedact: string[] = (payload.orders_to_redact || []).map(String);

    const merchant = shopDomain
      ? await prisma.merchant.findUnique({ where: { shopifyShop: shopDomain } })
      : null;

    let redactedCount = 0;

    if (merchant && ordersToRedact.length > 0) {
      // Redact PII from specified orders
      for (const shopifyOrderId of ordersToRedact) {
        const order = await prisma.order.findUnique({
          where: {
            merchantId_shopifyOrderId: {
              merchantId: merchant.id,
              shopifyOrderId,
            },
          },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              destinationAddress: '[REDACTED]',
              originAddress: '[REDACTED]',
            },
          });
          redactedCount++;
        }
      }
    }

    await prisma.webhookLog.create({
      data: {
        source: 'shopify',
        event: topic || 'customers/redact',
        payload: {
          shop_domain: shopDomain,
          customer_id: payload.customer?.id,
          orders_requested: ordersToRedact.length,
          orders_redacted: redactedCount,
        },
        processed: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing customers/redact webhook:', error);

    try {
      await prisma.webhookLog.create({
        data: {
          source: 'shopify',
          event: 'customers/redact',
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
