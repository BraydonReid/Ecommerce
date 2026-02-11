import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePDFReport } from '@/lib/pdf';

export async function GET(request: NextRequest) {
  try {
    const shop = request.nextUrl.searchParams.get('shop');
    if (!shop) {
      return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
    }

    const merchant = await prisma.merchant.findUnique({ where: { shopifyShop: shop } });
    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const emissions = await prisma.emissionRecord.findMany({
      where: { merchantId: merchant.id, calculatedAt: { gte: thirtyDaysAgo } },
      include: { order: true },
    });

    const totalEmissions = emissions.reduce((sum, e) => sum + e.totalCO2e, 0);
    const shippingEmissions = emissions.reduce((sum, e) => sum + e.shippingCO2e, 0);
    const packagingEmissions = emissions.reduce((sum, e) => sum + e.packagingCO2e, 0);

    const reportData = {
      merchant: { name: merchant.shopifyShop || merchant.email },
      period: { start: thirtyDaysAgo, end: new Date() },
      summary: {
        totalOrders: emissions.length,
        totalEmissions,
        shippingEmissions,
        packagingEmissions,
      },
    };

    const pdfBuffer = await generatePDFReport(reportData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="emissions-report-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
