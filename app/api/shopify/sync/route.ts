import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { calculateCarbonEmissions } from '@/lib/carbon';
import { detectShippingProvider, matchProviderToDatabase } from '@/lib/shipping-provider';

// Use environment variable for API version with fallback
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01';

/**
 * Sync orders and products from Shopify
 * POST /api/shopify/sync?shop=xxx
 */
export async function POST(request: NextRequest) {
  try {
    const shop = request.nextUrl.searchParams.get('shop');

    if (!shop) {
      return NextResponse.json(
        { error: 'Missing shop parameter' },
        { status: 400 }
      );
    }

    // Find merchant
    const merchant = await prisma.merchant.findUnique({
      where: { shopifyShop: shop },
    });

    if (!merchant || !merchant.shopifyAccessToken) {
      return NextResponse.json(
        { error: 'Merchant not found or not connected' },
        { status: 404 }
      );
    }

    const accessToken = merchant.shopifyAccessToken;
    let syncedProducts = 0;
    let syncedOrders = 0;
    let calculatedEmissions = 0;

    // Sync Products
    try {
      const productsResponse = await axios.get(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        }
      );

      const products = productsResponse.data.products || [];

      for (const product of products) {
        for (const variant of product.variants || []) {
          await prisma.product.upsert({
            where: {
              merchantId_shopifyProductId: {
                merchantId: merchant.id,
                shopifyProductId: variant.id.toString(),
              },
            },
            update: {
              title: `${product.title}${variant.title !== 'Default Title' ? ` - ${variant.title}` : ''}`,
              sku: variant.sku || null,
              weight: variant.weight ? parseFloat(variant.weight.toString()) / 1000 : null, // Convert to kg
            },
            create: {
              merchantId: merchant.id,
              shopifyProductId: variant.id.toString(),
              title: `${product.title}${variant.title !== 'Default Title' ? ` - ${variant.title}` : ''}`,
              sku: variant.sku || null,
              weight: variant.weight ? parseFloat(variant.weight.toString()) / 1000 : null,
            },
          });
          syncedProducts++;
        }
      }
    } catch (error) {
      console.error('Error syncing products:', error);
    }

    // Sync Orders
    try {
      const ordersResponse = await axios.get(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&limit=250`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        }
      );

      const orders = ordersResponse.data.orders || [];

      for (const shopifyOrder of orders) {
        // Check if order already exists
        const existingOrder = await prisma.order.findUnique({
          where: {
            merchantId_shopifyOrderId: {
              merchantId: merchant.id,
              shopifyOrderId: shopifyOrder.id.toString(),
            },
          },
          include: {
            emissions: true,
          },
        });

        // If order exists but has no emissions, calculate them
        if (existingOrder) {
          if (existingOrder.emissions.length === 0) {
            // Calculate emissions for existing order missing them
            const emissionResult = await calculateCarbonEmissions({
              totalWeight: existingOrder.totalWeight || 1,
              shippingDistance: existingOrder.shippingDistance || 500,
              shippingMethod: (existingOrder.shippingMethod as 'air' | 'sea' | 'road' | 'rail') || 'road',
              packagingType: (existingOrder.packagingType as 'cardboard' | 'plastic' | 'paper' | 'biodegradable') || 'cardboard',
              packagingWeight: existingOrder.packagingWeight || 0.1,
            });

            await prisma.emissionRecord.create({
              data: {
                merchantId: merchant.id,
                orderId: existingOrder.id,
                totalCO2e: emissionResult.totalCO2e,
                shippingCO2e: emissionResult.shippingCO2e,
                packagingCO2e: emissionResult.packagingCO2e,
                calculationMethod: emissionResult.calculationMethod,
              },
            });
            calculatedEmissions++;
          }
          continue; // Skip to next order
        }

        // Calculate total weight from line items
        let totalWeight = 0;
        for (const item of shopifyOrder.line_items || []) {
          const weight = item.grams ? item.grams / 1000 : 0.5; // Default 0.5kg if no weight
          totalWeight += weight * item.quantity;
        }

        // Get shipping details
        const shippingAddress = shopifyOrder.shipping_address;
        const shippingLines = shopifyOrder.shipping_lines || [];
        const shippingMethod = shippingLines[0]?.title?.toLowerCase() || 'standard';

        // Determine shipping method category
        let shippingMethodCategory = 'road';
        if (shippingMethod.includes('express') || shippingMethod.includes('overnight')) {
          shippingMethodCategory = 'air';
        } else if (shippingMethod.includes('standard') || shippingMethod.includes('ground')) {
          shippingMethodCategory = 'road';
        }

        // Estimate shipping distance (simplified - would need geocoding in production)
        const shippingDistance = 500; // Default 500km, should be calculated based on addresses

        // Extract shipping cost and details
        const shippingLine = shippingLines[0];
        const shippingCost = shippingLine ? parseFloat(shippingLine.price || '0') : 0;
        const carrierCode = shippingLine?.code || null;
        const carrierTitle = shippingLine?.title || null;

        // Create order
        const order = await prisma.order.create({
          data: {
            merchantId: merchant.id,
            shopifyOrderId: shopifyOrder.id.toString(),
            orderNumber: shopifyOrder.order_number.toString(),
            totalPrice: parseFloat(shopifyOrder.total_price || '0'),
            totalWeight: totalWeight || 1,
            shippingDistance: shippingDistance,
            shippingMethod: shippingMethodCategory,
            originAddress: merchant.shopifyShop,
            destinationAddress: shippingAddress
              ? `${shippingAddress.city}, ${shippingAddress.country}`
              : 'Unknown',
            packagingWeight: 0.1, // Default 100g packaging
            packagingType: 'cardboard',
            createdAt: new Date(shopifyOrder.created_at),
          },
        });

        // Create shipping record for optimization feature
        if (carrierTitle) {
          const detected = detectShippingProvider(carrierTitle, carrierCode || '');
          const matched = await matchProviderToDatabase(detected);

          await prisma.orderShippingRecord.create({
            data: {
              orderId: order.id,
              merchantId: merchant.id,
              detectedProviderName: detected.providerName,
              detectedServiceLevel: detected.serviceLevel,
              matchedProviderId: matched.providerId,
              shippingCost: shippingCost,
              shippingCurrency: shopifyOrder.currency || 'USD',
              carrierCode: carrierCode,
              carrierTitle: carrierTitle,
              costPerKg: totalWeight > 0 ? shippingCost / totalWeight : null,
              costPerKm: shippingDistance > 0 ? shippingCost / shippingDistance : null,
            },
          });
        }

        // Create order items
        for (const item of shopifyOrder.line_items || []) {
          const product = await prisma.product.findFirst({
            where: {
              merchantId: merchant.id,
              shopifyProductId: item.variant_id?.toString() || item.product_id?.toString(),
            },
          });

          if (product) {
            await prisma.orderItem.create({
              data: {
                orderId: order.id,
                productId: product.id,
                quantity: item.quantity,
                price: parseFloat(item.price || '0'),
              },
            });
          }
        }

        // Calculate carbon emissions
        const emissionResult = await calculateCarbonEmissions({
          totalWeight: totalWeight || 1,
          shippingDistance: shippingDistance,
          shippingMethod: shippingMethodCategory as 'air' | 'sea' | 'road' | 'rail',
          packagingType: 'cardboard',
          packagingWeight: 0.1,
        });

        // Store emission record
        await prisma.emissionRecord.create({
          data: {
            merchantId: merchant.id,
            orderId: order.id,
            totalCO2e: emissionResult.totalCO2e,
            shippingCO2e: emissionResult.shippingCO2e,
            packagingCO2e: emissionResult.packagingCO2e,
            calculationMethod: emissionResult.calculationMethod,
          },
        });

        syncedOrders++;
        calculatedEmissions++;
      }
    } catch (error) {
      console.error('Error syncing orders:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      stats: {
        syncedProducts,
        syncedOrders,
        calculatedEmissions,
      },
    });
  } catch (error) {
    console.error('Error in Shopify sync:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
