'use client';

import { ShippingRecommendation, ShippingRecommendationsResponse } from '@/types';

interface ShippingRecommendationsProps {
  summary: ShippingRecommendationsResponse['summary'];
  recommendations: ShippingRecommendation[];
  topRecommendation?: ShippingRecommendationsResponse['topRecommendation'];
}

export default function ShippingRecommendations({
  summary,
  recommendations,
  topRecommendation,
}: ShippingRecommendationsProps) {
  const priorityColors = {
    high: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
    low: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  };

  const typeIcons: Record<string, string> = {
    provider_switch: '🔄',
    service_downgrade: '⬇️',
    consolidation: '📦',
    offset: '🌳',
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💰</span>
            <div>
              <p className="text-blue-100 text-sm">Potential Monthly Savings</p>
              <p className="text-3xl font-bold">${summary.potentialCostSavings.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm mt-2">
            {summary.potentialCostSavingsPercent.toFixed(1)}% of current shipping spend
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🌱</span>
            <div>
              <p className="text-green-100 text-sm">Potential CO2 Reduction</p>
              <p className="text-3xl font-bold">{summary.potentialCO2Reduction.toFixed(2)} kg</p>
            </div>
          </div>
          <p className="text-green-100 text-sm mt-2">
            {summary.potentialCO2ReductionPercent.toFixed(1)}% of current emissions
          </p>
        </div>
      </div>

      {/* Top Recommendation Highlight */}
      {topRecommendation && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🏆</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-800 mb-2">Top Recommendation</h3>
              <p className="text-green-700 mb-3">
                Switch from <strong>{topRecommendation.fromProvider}</strong> to{' '}
                <strong>{topRecommendation.toProvider}</strong>
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="bg-white rounded-lg px-3 py-2 border border-green-200">
                  <span className="text-gray-500">Reason:</span>{' '}
                  <span className="text-gray-900">{topRecommendation.reason}</span>
                </div>
                <div className="bg-white rounded-lg px-3 py-2 border border-green-200">
                  <span className="text-gray-500">Impact:</span>{' '}
                  <span className="text-green-700 font-medium">{topRecommendation.impact}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Recommendations</h3>

        {recommendations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">✨</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              You're doing great!
            </h4>
            <p className="text-gray-600 max-w-md mx-auto">
              Based on your current shipping patterns, we don't have any specific
              recommendations at this time. Keep up the good work!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const colors = priorityColors[rec.priority];
              const icon = typeIcons[rec.type] || '💡';

              return (
                <div
                  key={index}
                  className={`${colors.bg} ${colors.border} border rounded-lg p-4`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${colors.badge}`}>
                          {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rec.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        {rec.estimatedCostSavings > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Cost Savings:</span>
                            <span className="font-medium text-green-600">
                              ${rec.estimatedCostSavings.toFixed(2)}/mo
                            </span>
                          </div>
                        )}
                        {rec.estimatedCO2Savings > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">CO2 Reduction:</span>
                            <span className="font-medium text-green-600">
                              {rec.estimatedCO2Savings.toFixed(2)} kg/mo
                            </span>
                          </div>
                        )}
                        {rec.affectedOrdersPercent !== undefined && rec.affectedOrdersPercent > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Affects:</span>
                            <span className="font-medium text-gray-700">
                              {rec.affectedOrdersPercent.toFixed(0)}% of orders
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>💡</span> Quick Tips for Greener Shipping
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Use ground shipping when delivery time allows
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Consolidate orders to reduce per-package emissions
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Choose carriers with carbon offset programs
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Optimize packaging to reduce weight and size
          </li>
        </ul>
      </div>
    </div>
  );
}
