'use client';

import { useEffect, useState } from 'react';
import ShippingMetricsCards from './ShippingMetricsCards';
import ProviderBreakdownChart from './ProviderBreakdownChart';
import ProviderComparisonTable from './ProviderComparisonTable';
import SavingsCalculator from './SavingsCalculator';
import ShippingRecommendations from './ShippingRecommendations';
import {
  ShippingCostsResponse,
  CompareResponse,
  ShippingRecommendationsResponse,
  ShippingOptimizationSettings,
} from '@/types';

interface ShippingOptimizationProps {
  shop: string;
  subscriptionTier: string;
}

export default function ShippingOptimization({
  shop,
  subscriptionTier,
}: ShippingOptimizationProps) {
  const [costsData, setCostsData] = useState<ShippingCostsResponse | null>(null);
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [recommendationsData, setRecommendationsData] =
    useState<ShippingRecommendationsResponse | null>(null);
  const [settings, setSettings] = useState<ShippingOptimizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'compare' | 'recommendations'>('overview');

  useEffect(() => {
    fetchAllData();
  }, [shop]);

  async function fetchAllData() {
    setLoading(true);
    setError('');

    try {
      // Fetch all data in parallel
      const [costsRes, settingsRes, recommendationsRes] = await Promise.all([
        fetch(`/api/shipping/costs?shop=${encodeURIComponent(shop)}&period=30d`),
        fetch(`/api/shipping/settings?shop=${encodeURIComponent(shop)}`),
        fetch(`/api/shipping/recommendations?shop=${encodeURIComponent(shop)}`),
      ]);

      if (costsRes.ok) {
        const costsResult = await costsRes.json();
        setCostsData(costsResult.data);
      }

      if (settingsRes.ok) {
        const settingsResult = await settingsRes.json();
        setSettings(settingsResult.data?.settings || null);
      }

      if (recommendationsRes.ok) {
        const recommendationsResult = await recommendationsRes.json();
        setRecommendationsData(recommendationsResult.data);
      }

      // Fetch comparison data
      const compareRes = await fetch(`/api/shipping/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop }),
      });

      if (compareRes.ok) {
        const compareResult = await compareRes.json();
        setCompareData(compareResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipping data');
    } finally {
      setLoading(false);
    }
  }

  async function updateSettings(newSettings: Partial<ShippingOptimizationSettings>) {
    try {
      const response = await fetch(`/api/shipping/settings?shop=${encodeURIComponent(shop)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        const result = await response.json();
        setSettings(result.data?.settings || null);
        // Refresh comparison data with new weights
        fetchAllData();
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-primary mr-3"></div>
          <p className="text-gray-600">Loading shipping optimization data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAllData}
            className="px-4 py-2 bg-green-primary text-white rounded-lg hover:bg-green-secondary transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasData = costsData && costsData.summary.totalOrders > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Shipping Optimization
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Compare providers to reduce costs and carbon emissions
          </p>
        </div>
        {subscriptionTier === 'free' && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Upgrade for advanced analytics
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No shipping data yet
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Once you sync orders from Shopify, you'll see shipping cost analysis and
            provider comparisons here.
          </p>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'overview'
                  ? 'border-green-primary text-green-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'compare'
                  ? 'border-green-primary text-green-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Compare Providers
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'recommendations'
                  ? 'border-green-primary text-green-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recommendations
            </button>
          </div>

          {activeTab === 'overview' && costsData && (
            <div className="space-y-6">
              {/* Metrics Cards */}
              <ShippingMetricsCards summary={costsData.summary} />

              {/* Provider Breakdown */}
              {costsData.byProvider.length > 0 && (
                <ProviderBreakdownChart providers={costsData.byProvider} />
              )}
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="space-y-6">
              {/* Savings Calculator */}
              <SavingsCalculator
                costWeight={settings?.costWeight ?? 50}
                carbonWeight={settings?.carbonWeight ?? 50}
                onWeightChange={(costWeight, carbonWeight) =>
                  updateSettings({ costWeight, carbonWeight })
                }
                potentialSavings={{
                  cost: recommendationsData?.summary.potentialCostSavings ?? 0,
                  co2e: recommendationsData?.summary.potentialCO2Reduction ?? 0,
                }}
              />

              {/* Comparison Table */}
              {compareData && (
                <ProviderComparisonTable
                  currentProvider={compareData.currentProvider}
                  alternatives={compareData.alternatives}
                  recommendation={compareData.recommendation}
                />
              )}
            </div>
          )}

          {activeTab === 'recommendations' && recommendationsData && (
            <ShippingRecommendations
              summary={recommendationsData.summary}
              recommendations={recommendationsData.recommendations}
              topRecommendation={recommendationsData.topRecommendation}
            />
          )}
        </>
      )}
    </div>
  );
}
