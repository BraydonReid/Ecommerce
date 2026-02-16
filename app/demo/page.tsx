'use client';

import { useState } from 'react';
import Link from 'next/link';
import EmissionsChart from '@/components/EmissionsChart';
import MetricsCard from '@/components/MetricsCard';

// Demo data
const demoData = {
  merchant: {
    id: 'demo',
    email: 'demo@greencommerce.io',
    shopifyShop: 'demo-eco-store.myshopify.com',
    subscriptionTier: 'premium',
  },
  summary: {
    totalOrders: 1247,
    totalEmissions: 4823.45,
    shippingEmissions: 3654.12,
    packagingEmissions: 1169.33,
  },
  chartData: generateChartData(),
  topProducts: [
    { id: '1', title: 'Organic Cotton T-Shirt', orderCount: 324, totalEmissions: 486.5 },
    { id: '2', title: 'Bamboo Water Bottle', orderCount: 287, totalEmissions: 402.3 },
    { id: '3', title: 'Recycled Canvas Tote', orderCount: 256, totalEmissions: 358.4 },
    { id: '4', title: 'Hemp Blend Hoodie', orderCount: 198, totalEmissions: 312.8 },
    { id: '5', title: 'Sustainable Sneakers', orderCount: 182, totalEmissions: 298.6 },
  ],
  recentOrders: [
    { id: '1', orderNumber: '#1247', date: '2 hours ago', emissions: 4.23, status: 'Fulfilled' },
    { id: '2', orderNumber: '#1246', date: '5 hours ago', emissions: 3.87, status: 'Fulfilled' },
    { id: '3', orderNumber: '#1245', date: '8 hours ago', emissions: 5.12, status: 'In Transit' },
    { id: '4', orderNumber: '#1244', date: '12 hours ago', emissions: 2.98, status: 'Fulfilled' },
    { id: '5', orderNumber: '#1243', date: '1 day ago', emissions: 4.56, status: 'Fulfilled' },
  ],
};

function generateChartData() {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic-looking emissions data with some variation
    const baseTotal = 150 + Math.random() * 50;
    const shipping = baseTotal * (0.7 + Math.random() * 0.1);
    const packaging = baseTotal - shipping;

    data.push({
      date: date.toISOString(),
      total: baseTotal,
      shipping: shipping,
      packaging: packaging,
    });
  }

  return data;
}

export default function DemoPage() {
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{ summary: string; recommendations: string } | null>(null);

  const generateDemoInsights = () => {
    setAiLoading(true);

    // Simulate AI loading
    setTimeout(() => {
      setAiInsights({
        summary: `Your store processed ${demoData.summary.totalOrders.toLocaleString()} orders last month, generating ${demoData.summary.totalEmissions.toFixed(2)} kg of CO2 emissions. Shipping accounts for 76% of your carbon footprint, while packaging contributes 24%. Your emissions per order average 3.87 kg CO2e, which is 15% below the industry average for sustainable fashion retailers.`,
        recommendations: `1. **Consolidate Shipments**: Consider offering incentives for customers to bundle orders. This could reduce shipping emissions by up to 25%.

2. **Switch to Biodegradable Packaging**: Replacing your current mixed packaging with 100% biodegradable materials could cut packaging emissions by 40%.

3. **Regional Fulfillment**: Your data shows 45% of orders ship to the West Coast. Setting up a regional fulfillment center there could reduce average shipping distances by 60%.

4. **Carbon Offset Program**: Partner with a verified carbon offset provider to offer customers the option to neutralize their order's impact.`,
      });
      setShowAIInsights(true);
      setAiLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 text-center">
        <p className="text-sm">
          This is a demo dashboard with sample data.{' '}
          <Link href="/register" className="underline font-semibold hover:text-purple-100">
            Sign up for free
          </Link>{' '}
          to track your own store&apos;s carbon footprint.
        </p>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GreenCommerce</h1>
                <p className="text-sm text-gray-600">Demo Store Dashboard</p>
              </div>
              <nav className="hidden md:flex gap-6">
                <span className="text-green-primary font-semibold">Dashboard</span>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
              </nav>
            </div>
            <div className="flex gap-4 items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                DEMO MODE
              </span>
              <Link
                href="/register"
                className="bg-green-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-secondary transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Orders"
            value={demoData.summary.totalOrders.toLocaleString()}
            subtitle="Last 30 days"
            icon="📦"
          />
          <MetricsCard
            title="Total Emissions"
            value={`${demoData.summary.totalEmissions.toFixed(0)} kg`}
            subtitle="CO2e"
            icon="🌍"
          />
          <MetricsCard
            title="Shipping"
            value={`${demoData.summary.shippingEmissions.toFixed(0)} kg`}
            subtitle="76% of total"
            icon="🚚"
          />
          <MetricsCard
            title="Packaging"
            value={`${demoData.summary.packagingEmissions.toFixed(0)} kg`}
            subtitle="24% of total"
            icon="📦"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Emissions Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Emissions Trend (Last 30 Days)
              </h2>
              <EmissionsChart data={demoData.chartData} />
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  AI-Powered Insights
                  <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                    PREMIUM
                  </span>
                </h3>
                {!showAIInsights && (
                  <button
                    onClick={generateDemoInsights}
                    disabled={aiLoading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? 'Generating...' : 'Generate Insights'}
                  </button>
                )}
              </div>

              {aiLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600">Analyzing your data...</span>
                </div>
              )}

              {showAIInsights && aiInsights && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
                    <p className="text-gray-700 leading-relaxed">{aiInsights.summary}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {aiInsights.recommendations}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAIInsights(false);
                      setAiInsights(null);
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Reset Demo
                  </button>
                </div>
              )}

              {!showAIInsights && !aiLoading && (
                <p className="text-gray-600">
                  Click &quot;Generate Insights&quot; to see AI-powered analysis and recommendations
                  based on your sustainability metrics.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Top Emitting Products
              </h2>
              <div className="space-y-3">
                {demoData.topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{product.title}</h3>
                        <p className="text-xs text-gray-600">{product.orderCount} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{product.totalEmissions.toFixed(0)} kg</p>
                      <p className="text-xs text-gray-500">CO2e</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Recent Orders
              </h2>
              <div className="space-y-3">
                {demoData.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-700">{order.emissions} kg CO2e</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'Fulfilled'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Ready to track your impact?</h3>
              <p className="text-green-100 text-sm mb-4">
                Connect your Shopify store and start measuring your carbon footprint in minutes.
              </p>
              <Link
                href="/register"
                className="block w-full bg-white text-green-600 py-2 px-4 rounded-lg font-semibold text-center hover:bg-green-50 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
