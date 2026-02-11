import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCarbonEmissions, determineShippingMethod, estimateShippingDistance } from '@/lib/carbon';
import shopify from '@/lib/shopify';

/**
 * Handle Shopify orders/create webhook
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity
    const hmac = request.headers.get('X-Shopify-Hmac-Sha256');
    const shop = request.headers.get('X-Shopify-Shop-Domain');
    const topic = request.headers.get('X-Shopify-Topic');

    const body = await request.text();
    const rawBody = Buffer.from(body);

    // Verify HMAC
    const isValid = await shopify.webhooks.validate({
      rawBody,
      rawRequest: request as any,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 401 });
    }

    const order = JSON.parse(body);

    // Find merchant
    const merchant = await prisma.merchant.findUnique({
      where: { shopifyShop: shop! },
    });

    if (!merchant) {
      console.error('Merchant not found for shop:', shop);
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    // Calculate total weight from line items
    const totalWeight = order.line_items.reduce(
      (sum: number, item: any) => sum + (item.grams || 0) * item.quantity,
      0
    ) / 1000; // Convert to kg

    // Get shipping method
    const shippingMethod = order.shipping_lines?.[0]
      ? determineShippingMethod(order.shipping_lines[0].title)
      : 'road';

    // Estimate shipping distance (simplified - use actual geocoding in production)
    const shippingDistance = estimateShippingDistance(
      'Warehouse', // In production, use actual origin
      order.shipping_address?.country || 'Unknown'
    );

    // Get merchant settings for packaging defaults
    const settings = await prisma.merchantSettings.findUnique({
      where: { merchantId: merchant.id },
    });

    const packagingWeight = settings?.defaultPackagingWeight || 0.1;
    const packagingType = settings?.defaultPackagingType || 'cardboard';

    // Store order in database
    const dbOrder = await prisma.order.create({
      data: {
        merchantId: merchant.id,
        shopifyOrderId: order.id.toString(),
        orderNumber: order.order_number.toString(),
        totalPrice: parseFloat(order.total_price),
        shippingDistance,
        shippingMethod,
        originAddress: 'Warehouse', // Update in production
        destinationAddress: order.shipping_address
          ? `${order.shipping_address.city}, ${order.shipping_address.country}`
          : 'Unknown',
        totalWeight,
        packagingWeight,
        packagingType,
      },
    });

    // Calculate carbon emissions
    const emissions = await calculateCarbonEmissions({
      shippingDistance,
      shippingMethod,
      totalWeight,
      packagingWeight,
      packagingType: packagingType as any,
    });

    // Store emissions record
    await prisma.emissionRecord.create({
      data: {
        merchantId: merchant.id,
        orderId: dbOrder.id,
        totalCO2e: emissions.totalCO2e,
        shippingCO2e: emissions.shippingCO2e,
        packagingCO2e: emissions.packagingCO2e,
        calculationMethod: emissions.calculationMethod,
      },
    });

    // Log webhook
    await prisma.webhookLog.create({
      data: {
        source: 'shopify',
        event: topic!,
        payload: order,
        processed: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing order webhook:', error);

    // Log failed webhook
    try {
      await prisma.webhookLog.create({
        data: {
          source: 'shopify',
          event: 'orders/create',
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
