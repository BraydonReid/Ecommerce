'use client';

import { CompareAlternative, CompareResponse } from '@/types';

interface ProviderComparisonTableProps {
  currentProvider: CompareResponse['currentProvider'];
  alternatives: CompareAlternative[];
  recommendation: CompareResponse['recommendation'];
}

export default function ProviderComparisonTable({
  currentProvider,
  alternatives,
  recommendation,
}: ProviderComparisonTableProps) {
  return (
    <div className="space-y-4">
      {/* Current Provider Summary */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Provider</p>
            <p className="text-lg font-semibold text-gray-900">{currentProvider.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Spend</p>
            <p className="text-lg font-semibold text-gray-900">
              ${currentProvider.cost.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Emissions</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentProvider.co2e.toFixed(2)} kg CO2e
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Banner */}
      {recommendation.bestOverall && recommendation.bestOverall !== 'N/A' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-green-800">Top Recommendation</p>
              <p className="text-sm text-green-700 mt-1">
                <strong>{recommendation.bestOverall}</strong> offers the best overall value based
                on your preferences.
                {recommendation.bestForCost !== recommendation.bestOverall && recommendation.bestForCost !== 'N/A' && (
                  <> For lowest cost, consider <strong>{recommendation.bestForCost}</strong>.</>
                )}
                {recommendation.bestForCarbon !== recommendation.bestOverall && recommendation.bestForCarbon !== 'N/A' && (
                  <> For lowest carbon, consider <strong>{recommendation.bestForCarbon}</strong>.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alternatives Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-700">Provider</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Service Level</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Est. Cost</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Cost Savings</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Est. CO2e</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">CO2 Savings</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Delivery</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-center">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {alternatives.map((alt, index) => {
              const isBestOverall =
                `${alt.providerName} ${alt.serviceLevel}` === recommendation.bestOverall;
              const isBestCost =
                `${alt.providerName} ${alt.serviceLevel}` === recommendation.bestForCost;
              const isBestCarbon =
                `${alt.providerName} ${alt.serviceLevel}` === recommendation.bestForCarbon;

              return (
                <tr
                  key={`${alt.providerId}-${alt.serviceLevel}`}
                  className={`${isBestOverall ? 'bg-green-50' : ''} hover:bg-gray-50`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{alt.providerName}</span>
                      {alt.carbonOffsetAvailable && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          Offset
                        </span>
                      )}
                      {isBestOverall && (
                        <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                          Best
                        </span>
                      )}
                      {!isBestOverall && isBestCost && (
                        <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                          Cheapest
                        </span>
                      )}
                      {!isBestOverall && isBestCarbon && (
                        <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                          Greenest
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{alt.serviceLevel}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${alt.estimatedCost.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {alt.costSavings > 0 ? (
                      <span className="text-green-600">
                        -${alt.costSavings.toFixed(2)} ({alt.costSavingsPercent.toFixed(1)}%)
                      </span>
                    ) : alt.costSavings < 0 ? (
                      <span className="text-red-600">
                        +${Math.abs(alt.costSavings).toFixed(2)} ({Math.abs(alt.costSavingsPercent).toFixed(1)}%)
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {alt.estimatedCO2e.toFixed(3)} kg
                  </td>
                  <td className="px-4 py-3 text-right">
                    {alt.co2Savings > 0 ? (
                      <span className="text-green-600">
                        -{alt.co2Savings.toFixed(3)} kg ({alt.co2SavingsPercent.toFixed(1)}%)
                      </span>
                    ) : alt.co2Savings < 0 ? (
                      <span className="text-red-600">
                        +{Math.abs(alt.co2Savings).toFixed(3)} kg ({Math.abs(alt.co2SavingsPercent).toFixed(1)}%)
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {alt.deliveryDays} day{alt.deliveryDays !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
                        alt.recommendationScore >= 50
                          ? 'bg-green-100 text-green-700'
                          : alt.recommendationScore >= 25
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {Math.round(alt.recommendationScore)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {alternatives.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No alternative providers available for comparison.
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2">
        <div className="flex items-center gap-1">
          <span className="bg-green-500 text-white px-1.5 py-0.5 rounded">Best</span>
          <span>Best overall value</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded">Cheapest</span>
          <span>Lowest cost option</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded">Greenest</span>
          <span>Lowest emissions</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Offset</span>
          <span>Carbon offset available</span>
        </div>
      </div>
    </div>
  );
}
