import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * Get dashboard analytics for a merchant
 * GET /api/analytics/dashboard
 *
 * Authentication: Requires a valid session
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const merchant = await prisma.merchant.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      );
    }

    // Get total orders count
    const totalOrders = await prisma.order.count({
      where: { merchantId: merchant.id },
    });

    // Get total emissions
    const totalEmissions = await prisma.emissionRecord.aggregate({
      where: { merchantId: merchant.id },
      _sum: {
        totalCO2e: true,
        shippingCO2e: true,
        packagingCO2e: true,
      },
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { merchantId: merchant.id },
      include: {
        emissions: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get top emitting products
    const topProducts = await prisma.product.findMany({
      where: { merchantId: merchant.id },
      include: {
        orderItems: {
          include: {
            order: {
              include: {
                emissions: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    // Calculate emissions by product
    const productEmissions = topProducts
      .map((product) => {
        const totalEmissions = product.orderItems.reduce((sum, item) => {
          const orderEmission = item.order.emissions[0]?.totalCO2e || 0;
          // Allocate order emissions proportionally by product weight
          const itemWeight = product.weight || 0.5; // Fallback: avg small parcel weight
          const orderWeight = item.order.totalWeight || 0.5;
          const itemEmission = (orderEmission * itemWeight) / orderWeight;
          return sum + itemEmission * item.quantity;
        }, 0);

        return {
          id: product.id,
          title: product.title,
          sku: product.sku,
          totalEmissions,
          orderCount: product.orderItems.length,
        };
      })
      .sort((a, b) => b.totalEmissions - a.totalEmissions)
      .slice(0, 5);

    // Get daily emissions for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyEmissions = await prisma.emissionRecord.findMany({
      where: {
        merchantId: merchant.id,
        calculatedAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { calculatedAt: 'asc' },
    });

    // Group by date
    const emissionsByDate = dailyEmissions.reduce((acc: any, record) => {
      const date = record.calculatedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          shipping: 0,
          packaging: 0,
        };
      }
      acc[date].total += record.totalCO2e;
      acc[date].shipping += record.shippingCO2e;
      acc[date].packaging += record.packagingCO2e;
      return acc;
    }, {});

    const chartData = Object.values(emissionsByDate);

    return NextResponse.json({
      merchant: {
        id: merchant.id,
        email: merchant.email,
        shopifyShop: merchant.shopifyShop,
        subscriptionTier: merchant.subscriptionTier,
      },
      summary: {
        totalOrders,
        totalEmissions: totalEmissions._sum.totalCO2e || 0,
        shippingEmissions: totalEmissions._sum.shippingCO2e || 0,
        packagingEmissions: totalEmissions._sum.packagingCO2e || 0,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        emissions: order.emissions[0] || null,
      })),
      topProducts: productEmissions,
      chartData,
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
