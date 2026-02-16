import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCarbonEmissions, determineShippingMethod, estimateShippingDistance } from '@/lib/carbon';
import shopify from '@/lib/shopify';

/**
 * Handle Shopify orders/updated webhook
 * Updates existing order data and recalculates emissions if needed.
 */
export async function POST(request: NextRequest) {
  try {
    const hmac = request.headers.get('X-Shopify-Hmac-Sha256');
    const shop = request.headers.get('X-Shopify-Shop-Domain');
    const topic = request.headers.get('X-Shopify-Topic');

    const rawBody = await request.text();

    // Verify HMAC
    const isValid = await shopify.webhooks.validate({
      rawBody,
      rawRequest: request as any,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 401 });
    }

    const order = JSON.parse(rawBody);

    // Find merchant
    const merchant = await prisma.merchant.findUnique({
      where: { shopifyShop: shop! },
    });

    if (!merchant) {
      console.error('Merchant not found for shop:', shop);
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: {
        merchantId_shopifyOrderId: {
          merchantId: merchant.id,
          shopifyOrderId: order.id.toString(),
        },
      },
      include: { emissions: true },
    });

    // Calculate updated values
    const totalWeight = order.line_items.reduce(
      (sum: number, item: any) => sum + (item.grams || 0) * item.quantity,
      0
    ) / 1000;

    const shippingMethod = order.shipping_lines?.[0]
      ? determineShippingMethod(order.shipping_lines[0].title)
      : 'road';

    const shippingDistance = estimateShippingDistance(
      'Warehouse',
      order.shipping_address?.country || 'Unknown'
    );

    const destinationAddress = order.shipping_address
      ? `${order.shipping_address.city}, ${order.shipping_address.country}`
      : 'Unknown';

    const settings = await prisma.merchantSettings.findUnique({
      where: { merchantId: merchant.id },
    });

    const packagingWeight = settings?.defaultPackagingWeight || 0.1;
    const packagingType = settings?.defaultPackagingType || 'cardboard';

    if (existingOrder) {
      // Update existing order
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          totalPrice: parseFloat(order.total_price),
          totalWeight,
          shippingMethod,
          shippingDistance,
          destinationAddress,
        },
      });

      // Recalculate emissions
      const emissions = await calculateCarbonEmissions({
        shippingDistance,
        shippingMethod,
        totalWeight,
        packagingWeight,
        packagingType: packagingType as any,
      });

      if (existingOrder.emissions.length > 0) {
        await prisma.emissionRecord.update({
          where: { id: existingOrder.emissions[0].id },
          data: {
            totalCO2e: emissions.totalCO2e,
            shippingCO2e: emissions.shippingCO2e,
            packagingCO2e: emissions.packagingCO2e,
            calculationMethod: emissions.calculationMethod,
          },
        });
      } else {
        await prisma.emissionRecord.create({
          data: {
            merchantId: merchant.id,
            orderId: existingOrder.id,
            totalCO2e: emissions.totalCO2e,
            shippingCO2e: emissions.shippingCO2e,
            packagingCO2e: emissions.packagingCO2e,
            calculationMethod: emissions.calculationMethod,
          },
        });
      }
    } else {
      // Create new order if it doesn't exist yet (edge case)
      const dbOrder = await prisma.order.create({
        data: {
          merchantId: merchant.id,
          shopifyOrderId: order.id.toString(),
          orderNumber: order.order_number.toString(),
          totalPrice: parseFloat(order.total_price),
          shippingDistance,
          shippingMethod,
          originAddress: 'Warehouse',
          destinationAddress,
          totalWeight,
          packagingWeight,
          packagingType,
        },
      });

      const emissions = await calculateCarbonEmissions({
        shippingDistance,
        shippingMethod,
        totalWeight,
        packagingWeight,
        packagingType: packagingType as any,
      });

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
    }

    await prisma.webhookLog.create({
      data: {
        source: 'shopify',
        event: topic || 'orders/updated',
        payload: { orderId: order.id, shop },
        processed: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing orders/updated webhook:', error);

    try {
      await prisma.webhookLog.create({
        data: {
          source: 'shopify',
          event: 'orders/updated',
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
