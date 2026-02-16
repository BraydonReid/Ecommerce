'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import EmissionsChart from '@/components/EmissionsChart';
import MetricsCard from '@/components/MetricsCard';
import { ShippingOptimization } from '@/components/shipping';

interface DashboardData {
  merchant: {
    id: string;
    email: string;
    shopifyShop: string | null;
    subscriptionTier: string;
  };
  summary: {
    totalOrders: number;
    totalEmissions: number;
    shippingEmissions: number;
    packagingEmissions: number;
  };
  recentOrders: any[];
  topProducts: any[];
  chartData: any[];
}

export default function RealDashboard({ shop }: { shop?: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [needsShopifyAuth, setNeedsShopifyAuth] = useState(false);

  useEffect(() => {
    fetchData();
  }, [shop]);

  async function fetchData() {
    try {
      const response = await fetch('/api/analytics/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function syncShopifyData() {
    if (!data?.merchant.shopifyShop) return;

    setSyncing(true);
    setSyncMessage('');

    try {
      const response = await fetch('/api/shopify/sync', { method: 'POST' });

      const result = await response.json();

      if (!response.ok) {
        if (result.needsAuth) {
          setSyncMessage('⚠️ Store not authorized. Please click "Connect Store" below to complete the Shopify authorization.');
          setNeedsShopifyAuth(true);
        } else {
          setSyncMessage(`❌ ${result.error || 'Sync failed. Please try again.'}`);
        }
        return;
      }

      setSyncMessage(
        `✅ Synced ${result.stats.syncedOrders} orders and ${result.stats.syncedProducts} products`
      );

      // Refresh dashboard data
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (err) {
      setSyncMessage('❌ Failed to sync data. Please check your connection and try again.');
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Dashboard</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Failed to fetch dashboard data. Please try again.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="block w-full bg-green-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-secondary transition"
            >
              Retry
            </button>
            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { merchant, summary, chartData, topProducts } = data;
  const hasOrders = summary.totalOrders > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🌱 GreenCommerce</h1>
                <p className="text-sm text-gray-600">
                  {merchant.shopifyShop || merchant.email}
                </p>
              </div>
              <nav className="hidden md:flex gap-6">
                <Link href={`/dashboard?shop=${merchant.shopifyShop}`} className="text-green-primary font-semibold">
                  Dashboard
                </Link>
                <a
                  href={`/api/reports/pdf?shop=${merchant.shopifyShop}`}
                  className="text-gray-600 hover:text-gray-900"
                  target="_blank"
                >
                  Download Report
                </a>
                {merchant.subscriptionTier === 'free' && (
                  <Link href={`/pricing?shop=${merchant.shopifyShop}`} className="text-orange-600 hover:text-orange-700 font-semibold">
                    Upgrade
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={syncShopifyData}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </span>
                ) : (
                  '🔄 Sync Orders'
                )}
              </button>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {merchant.subscriptionTier.toUpperCase()}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
          {syncMessage && (
            <div className="mt-3 text-sm">
              {syncMessage}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {needsShopifyAuth && merchant.shopifyShop && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="text-3xl mr-4">🔗</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Shopify Authorization Required
                </h3>
                <p className="text-yellow-700 mb-4">
                  Your account is linked to <strong>{merchant.shopifyShop}</strong> but the app hasn't been authorized to access your store data yet.
                  Please connect your store to enable order syncing and emissions tracking.
                </p>
                <a
                  href="/connect"
                  className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition"
                >
                  Connect Store
                </a>
              </div>
            </div>
          </div>
        )}
        {!hasOrders ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="text-3xl mr-4">🎉</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Store Connected Successfully!
                </h3>
                <p className="text-blue-700 mb-4">
                  Your Shopify store is now connected. Click the "Sync Orders" button above to import your existing orders,
                  or new orders will be automatically tracked as they come in via webhooks.
                </p>
                <button
                  onClick={syncShopifyData}
                  disabled={syncing}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {syncing ? 'Syncing...' : '🔄 Import Existing Orders'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <MetricsCard
                title="Total Orders"
                value={summary.totalOrders.toString()}
                subtitle="All time"
                icon="📦"
              />
              <MetricsCard
                title="Total Emissions"
                value={`${summary.totalEmissions.toFixed(2)} kg`}
                subtitle="CO2e"
                icon="🌍"
              />
              <MetricsCard
                title="Shipping"
                value={`${summary.shippingEmissions.toFixed(2)} kg`}
                subtitle="CO2e from shipping"
                icon="🚚"
              />
              <MetricsCard
                title="Packaging"
                value={`${summary.packagingEmissions.toFixed(2)} kg`}
                subtitle="CO2e from packaging"
                icon="📦"
              />
            </div>

            {/* Emissions Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Emissions Over Time (Last 30 Days)
                </h2>
                <EmissionsChart data={chartData} />
              </div>
            )}

            {/* Shipping Optimization Section */}
            {merchant.shopifyShop && (
              <ShippingOptimization
                shop={merchant.shopifyShop}
                subscriptionTier={merchant.subscriptionTier}
              />
            )}

            {/* Top Products */}
            {topProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Top Emitting Products
                </h2>
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {product.orderCount} order{product.orderCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          {product.totalEmissions.toFixed(2)} kg
                        </p>
                        <p className="text-xs text-gray-500">CO2e</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
