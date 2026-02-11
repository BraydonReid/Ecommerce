import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * Get analytics summary for the merchant
 * GET /api/analytics/summary?period=month&year=2024&month=1
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const merchantId = (session.user as any).id;
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || 'month';
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

  try {
    // Calculate date range
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get all emissions for the period
    const emissions = await prisma.emissionRecord.findMany({
      where: {
        merchantId,
        calculatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // Calculate totals
    const totalCO2e = emissions.reduce((sum, e) => sum + e.totalCO2e, 0);
    const shippingCO2e = emissions.reduce((sum, e) => sum + e.shippingCO2e, 0);
    const packagingCO2e = emissions.reduce((sum, e) => sum + e.packagingCO2e, 0);
    const orderCount = emissions.length;

    // Calculate per-product emissions
    const productEmissions = new Map<string, { name: string; emissions: number }>();

    emissions.forEach((emission) => {
      emission.order.items.forEach((item) => {
        const productKey = item.product.id;
        const productName = item.product.title;
        const itemEmission = (emission.totalCO2e / emission.order.items.length) * item.quantity;

        if (productEmissions.has(productKey)) {
          productEmissions.get(productKey)!.emissions += itemEmission;
        } else {
          productEmissions.set(productKey, {
            name: productName,
            emissions: itemEmission,
          });
        }
      });
    });

    // Get top emitting products
    const topEmittingProducts = Array.from(productEmissions.values())
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 5);

    // Calculate month-over-month change
    const prevMonthStart = new Date(year, month - 2, 1);
    const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59);

    const prevMonthEmissions = await prisma.emissionRecord.findMany({
      where: {
        merchantId,
        calculatedAt: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
      },
    });

    const prevMonthTotal = prevMonthEmissions.reduce((sum, e) => sum + e.totalCO2e, 0);
    const monthOverMonthChange =
      prevMonthTotal > 0 ? ((totalCO2e - prevMonthTotal) / prevMonthTotal) * 100 : 0;

    // Get daily breakdown for charts
    // Note: Prisma uses camelCase field names which map to the same column names in PostgreSQL
    const dailyBreakdown = await prisma.$queryRaw<
      Array<{ date: Date; total: number; shipping: number; packaging: number }>
    >`
      SELECT
        DATE("calculatedAt") as date,
        SUM("totalCO2e") as total,
        SUM("shippingCO2e") as shipping,
        SUM("packagingCO2e") as packaging
      FROM "EmissionRecord"
      WHERE "merchantId" = ${merchantId}
        AND "calculatedAt" >= ${startDate}
        AND "calculatedAt" <= ${endDate}
      GROUP BY DATE("calculatedAt")
      ORDER BY date ASC
    `;

    return NextResponse.json({
      summary: {
        totalCO2e,
        shippingCO2e,
        packagingCO2e,
        orderCount,
        avgCO2ePerOrder: orderCount > 0 ? totalCO2e / orderCount : 0,
        monthOverMonthChange,
      },
      topEmittingProducts,
      dailyBreakdown,
      period: `${year}-${month.toString().padStart(2, '0')}`,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
