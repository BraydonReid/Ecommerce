import puppeteer from 'puppeteer';

interface ReportData {
  merchant: {
    name: string;
  };
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalOrders: number;
    totalEmissions: number;
    shippingEmissions: number;
    packagingEmissions: number;
  };
}

/**
 * Generate a PDF sustainability report using Puppeteer
 */
export async function generatePDFReport(data: ReportData): Promise<Buffer> {
  const { merchant, period, summary } = data;
  const totalEmissions = summary.totalEmissions || 0.01; // Avoid division by zero

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sustainability Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', 'Arial', sans-serif;
      padding: 40px;
      color: #1f2937;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #10b981;
    }
    .header h1 {
      color: #10b981;
      font-size: 32px;
      margin-bottom: 8px;
    }
    .header .subtitle {
      color: #6b7280;
      font-size: 14px;
    }
    .header .merchant {
      color: #374151;
      font-size: 18px;
      font-weight: 600;
      margin-top: 12px;
    }
    .metrics-grid {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin: 40px 0;
    }
    .metric-card {
      flex: 1;
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      border: 1px solid #d1fae5;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }
    .metric-value {
      font-size: 36px;
      font-weight: 700;
      color: #059669;
      margin: 8px 0;
    }
    .metric-label {
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-unit {
      color: #9ca3af;
      font-size: 14px;
    }
    .section {
      margin: 40px 0;
    }
    .section h2 {
      color: #1f2937;
      font-size: 22px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .breakdown-container {
      display: flex;
      gap: 24px;
    }
    .breakdown-card {
      flex: 1;
      background: #f9fafb;
      border-radius: 12px;
      padding: 24px;
    }
    .breakdown-card h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      margin-bottom: 12px;
    }
    .breakdown-value {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .breakdown-value.shipping { color: #3b82f6; }
    .breakdown-value.packaging { color: #f97316; }
    .breakdown-percent {
      color: #6b7280;
      font-size: 14px;
    }
    .insights-list {
      background: #f9fafb;
      border-radius: 12px;
      padding: 24px;
    }
    .insights-list li {
      margin-bottom: 12px;
      padding-left: 8px;
    }
    .recommendations {
      background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
      border: 1px solid #fde68a;
      border-radius: 12px;
      padding: 24px;
    }
    .recommendations ol {
      padding-left: 20px;
    }
    .recommendations li {
      margin-bottom: 12px;
    }
    .recommendations strong {
      color: #92400e;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    .equivalents {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }
    .equivalent-card {
      flex: 1;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .equivalent-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .equivalent-value {
      font-size: 20px;
      font-weight: 600;
      color: #0369a1;
    }
    .equivalent-label {
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Sustainability Report</h1>
    <p class="subtitle">
      ${new Date(period.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} -
      ${new Date(period.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
    </p>
    <p class="merchant">${merchant.name}</p>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-label">Total Emissions</div>
      <div class="metric-value">${summary.totalEmissions.toFixed(2)}</div>
      <div class="metric-unit">kg CO2e</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Orders Analyzed</div>
      <div class="metric-value">${summary.totalOrders}</div>
      <div class="metric-unit">orders</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Avg per Order</div>
      <div class="metric-value">${summary.totalOrders > 0 ? (summary.totalEmissions / summary.totalOrders).toFixed(2) : '0.00'}</div>
      <div class="metric-unit">kg CO2e</div>
    </div>
  </div>

  <div class="section">
    <h2>Emissions Breakdown</h2>
    <div class="breakdown-container">
      <div class="breakdown-card">
        <h3>Shipping</h3>
        <div class="breakdown-value shipping">${summary.shippingEmissions.toFixed(2)} kg CO2e</div>
        <div class="breakdown-percent">${((summary.shippingEmissions / totalEmissions) * 100).toFixed(1)}% of total</div>
      </div>
      <div class="breakdown-card">
        <h3>Packaging</h3>
        <div class="breakdown-value packaging">${summary.packagingEmissions.toFixed(2)} kg CO2e</div>
        <div class="breakdown-percent">${((summary.packagingEmissions / totalEmissions) * 100).toFixed(1)}% of total</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Environmental Equivalents</h2>
    <div class="equivalents">
      <div class="equivalent-card">
        <div class="equivalent-icon">🚗</div>
        <div class="equivalent-value">${(summary.totalEmissions * 4.0).toFixed(0)} km</div>
        <div class="equivalent-label">Driving distance (EPA)</div>
      </div>
      <div class="equivalent-card">
        <div class="equivalent-icon">🌳</div>
        <div class="equivalent-value">${(summary.totalEmissions / 22).toFixed(1)}</div>
        <div class="equivalent-label">Trees needed (1 year, USDA)</div>
      </div>
      <div class="equivalent-card">
        <div class="equivalent-icon">💡</div>
        <div class="equivalent-value">${(summary.totalEmissions * 40).toFixed(0)} hrs</div>
        <div class="equivalent-label">60W bulb hours (EPA)</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Key Insights</h2>
    <div class="insights-list">
      <ul>
        <li>Your store processed <strong>${summary.totalOrders} orders</strong> during this period, generating <strong>${summary.totalEmissions.toFixed(2)} kg of CO2 emissions</strong>.</li>
        <li>Shipping accounts for <strong>${((summary.shippingEmissions / totalEmissions) * 100).toFixed(1)}%</strong> of your total carbon footprint.</li>
        <li>Packaging contributes <strong>${((summary.packagingEmissions / totalEmissions) * 100).toFixed(1)}%</strong> of emissions.</li>
        <li>Your average emissions per order is <strong>${summary.totalOrders > 0 ? (summary.totalEmissions / summary.totalOrders).toFixed(2) : '0.00'} kg CO2e</strong>.</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <h2>Recommendations</h2>
    <div class="recommendations">
      <ol>
        <li><strong>Optimize Shipping Routes:</strong> Consider consolidating shipments or using regional fulfillment centers to reduce shipping distances and emissions.</li>
        <li><strong>Switch to Eco-Friendly Packaging:</strong> Replace plastic materials with biodegradable or recycled alternatives to reduce packaging emissions by up to 40%.</li>
        <li><strong>Offer Carbon-Neutral Shipping:</strong> Partner with carbon offset programs to give customers the option to neutralize their order's environmental impact.</li>
        <li><strong>Local Sourcing:</strong> Where possible, source products from local suppliers to minimize transportation emissions.</li>
      </ol>
    </div>
  </div>

  <div class="footer">
    <p>Generated by GreenCommerce Intelligence Platform</p>
    <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
</body>
</html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

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

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
