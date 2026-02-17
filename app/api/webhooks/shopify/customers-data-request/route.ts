import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyShopifyWebhookHmac } from '@/lib/shopify';

/**
 * Handle Shopify customers/data_request webhook (GDPR mandatory)
 * Shopify sends this when a customer requests their data.
 * We acknowledge the request and log the data we hold.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  if (!verifyShopifyWebhookHmac(rawBody, hmac)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const topic = request.headers.get('X-Shopify-Topic');
    const shop = request.headers.get('X-Shopify-Shop-Domain');

    const payload = JSON.parse(rawBody);
    const customerEmail = payload.customer?.email;
    const shopDomain = payload.shop_domain || shop;

    // Find merchant
    const merchant = shopDomain
      ? await prisma.merchant.findUnique({ where: { shopifyShop: shopDomain } })
      : null;

    if (merchant && customerEmail) {
      // Query all orders that have this customer's info in the destination address
      const orders = await prisma.order.findMany({
        where: {
          merchantId: merchant.id,
          destinationAddress: { contains: customerEmail },
        },
        include: {
          emissions: true,
          shippingRecord: true,
        },
      });

      // Log what data we hold for this customer
      await prisma.webhookLog.create({
        data: {
          source: 'shopify',
          event: topic || 'customers/data_request',
          payload: {
            shop_domain: shopDomain,
            customer: payload.customer,
            orders_found: orders.length,
            data_held: orders.map((o) => ({
              orderNumber: o.orderNumber,
              destinationAddress: o.destinationAddress,
              createdAt: o.createdAt,
            })),
          },
          processed: true,
        },
      });
    } else {
      await prisma.webhookLog.create({
        data: {
          source: 'shopify',
          event: topic || 'customers/data_request',
          payload,
          processed: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing customers/data_request webhook:', error);

    try {
      await prisma.webhookLog.create({
        data: {
          source: 'shopify',
          event: 'customers/data_request',
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
