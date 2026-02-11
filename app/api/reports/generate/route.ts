import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';

/**
 * Generate a PDF sustainability report
 * POST /api/reports/generate
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const merchantId = (session.user as any).id;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { period } = body;

  // Validate period format (YYYY-MM)
  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    return NextResponse.json(
      { error: 'Invalid period format. Use YYYY-MM (e.g., 2024-01)' },
      { status: 400 }
    );
  }

  try {
    const [year, month] = period.split('-').map(Number);

    // Validate year and month values
    if (year < 2020 || year > 2100 || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid year or month value' },
        { status: 400 }
      );
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Fetch emissions data
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

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    // Calculate totals
    const totalCO2e = emissions.reduce((sum, e) => sum + e.totalCO2e, 0);
    const shippingCO2e = emissions.reduce((sum, e) => sum + e.shippingCO2e, 0);
    const packagingCO2e = emissions.reduce((sum, e) => sum + e.packagingCO2e, 0);
    const orderCount = emissions.length;

    // Prevent division by zero
    const avgPerOrder = orderCount > 0 ? totalCO2e / orderCount : 0;
    const shippingPercent = totalCO2e > 0 ? (shippingCO2e / totalCO2e) * 100 : 0;
    const packagingPercent = totalCO2e > 0 ? (packagingCO2e / totalCO2e) * 100 : 0;

    // Escape HTML to prevent XSS
    const escapeHtml = (str: string) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const merchantEmail = escapeHtml(merchant?.email || 'Merchant');

    // Generate HTML report
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sustainability Report - ${period}</title>
  <style>
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      margin: 0;
      padding: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #10b981;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #10b981;
      margin: 0;
      font-size: 32px;
    }
    .header p {
      color: #666;
      margin: 10px 0 0 0;
    }
    .metrics {
      display: flex;
      justify-content: space-around;
      margin: 40px 0;
    }
    .metric {
      text-align: center;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      min-width: 150px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #10b981;
      margin: 10px 0;
    }
    .metric-label {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin: 40px 0;
    }
    .section h2 {
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .breakdown {
      display: flex;
      gap: 20px;
      margin: 20px 0;
    }
    .breakdown-item {
      flex: 1;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌱 Sustainability Report</h1>
    <p>${new Date(startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
    <p>${merchantEmail}</p>
  </div>

  <div class="metrics">
    <div class="metric">
      <div class="metric-label">Total Emissions</div>
      <div class="metric-value">${totalCO2e.toFixed(2)}</div>
      <div class="metric-label">kg CO₂e</div>
    </div>
    <div class="metric">
      <div class="metric-label">Orders Analyzed</div>
      <div class="metric-value">${orderCount}</div>
      <div class="metric-label">orders</div>
    </div>
    <div class="metric">
      <div class="metric-label">Avg per Order</div>
      <div class="metric-value">${avgPerOrder.toFixed(2)}</div>
      <div class="metric-label">kg CO₂e</div>
    </div>
  </div>

  <div class="section">
    <h2>Emissions Breakdown</h2>
    <div class="breakdown">
      <div class="breakdown-item">
        <h3>🚚 Shipping</h3>
        <p style="font-size: 24px; font-weight: bold; color: #3b82f6;">${shippingCO2e.toFixed(2)} kg CO₂e</p>
        <p style="color: #666;">${shippingPercent.toFixed(1)}% of total</p>
      </div>
      <div class="breakdown-item">
        <h3>📦 Packaging</h3>
        <p style="font-size: 24px; font-weight: bold; color: #f97316;">${packagingCO2e.toFixed(2)} kg CO₂e</p>
        <p style="color: #666;">${packagingPercent.toFixed(1)}% of total</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Key Insights</h2>
    <ul style="line-height: 1.8;">
      <li>Your store processed ${orderCount} orders this period, generating ${totalCO2e.toFixed(2)} kg of CO₂ emissions.</li>
      <li>Shipping accounted for ${shippingPercent.toFixed(1)}% of total emissions.</li>
      <li>Average emissions per order: ${avgPerOrder.toFixed(2)} kg CO₂e.</li>
      <li>Equivalent to driving a car approximately ${(totalCO2e * 4.6).toFixed(0)} km.</li>
    </ul>
  </div>

  <div class="section">
    <h2>Recommendations</h2>
    <ol style="line-height: 1.8;">
      <li><strong>Optimize Shipping Routes:</strong> Consider consolidating shipments or using regional warehouses to reduce shipping distances.</li>
      <li><strong>Switch to Eco-Friendly Packaging:</strong> Replace plastic packaging with biodegradable or recycled materials to reduce packaging emissions.</li>
      <li><strong>Carbon Offset Programs:</strong> Consider partnering with carbon offset programs to neutralize your remaining emissions.</li>
    </ol>
  </div>

  <div class="footer">
    <p>Generated by GreenCommerce Intelligence Platform</p>
    <p>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
</body>
</html>
    `;

    // Generate PDF using Puppeteer with proper cleanup
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 30000, // 30 second timeout for browser launch
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px',
        },
      });

      // Return PDF
      return new NextResponse(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="sustainability-report-${period}.pdf"`,
        },
      });
    } finally {
      // Always close browser to prevent memory leaks
      if (browser) {
        await browser.close().catch(() => {
          // Ignore close errors
        });
      }
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
