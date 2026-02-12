'use client';

import { ProviderBreakdown } from '@/types';

interface ProviderBreakdownChartProps {
  providers: ProviderBreakdown[];
}

export default function ProviderBreakdownChart({ providers }: ProviderBreakdownChartProps) {
  // Colors for different providers
  const colors = [
    { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700' },
    { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700' },
    { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700' },
    { bg: 'bg-pink-500', light: 'bg-pink-100', text: 'text-pink-700' },
    { bg: 'bg-gray-500', light: 'bg-gray-100', text: 'text-gray-700' },
  ];

  const totalCost = providers.reduce((sum, p) => sum + p.totalCost, 0);
  const totalCO2e = providers.reduce((sum, p) => sum + p.totalCO2e, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cost Distribution */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Cost Distribution by Provider</h3>

        {/* Visual Bar */}
        <div className="h-8 rounded-lg overflow-hidden flex mb-4">
          {providers.map((provider, index) => {
            const percentage = totalCost > 0 ? (provider.totalCost / totalCost) * 100 : 0;
            if (percentage < 1) return null;
            return (
              <div
                key={provider.providerName}
                className={`${colors[index % colors.length].bg} transition-all`}
                style={{ width: `${percentage}%` }}
                title={`${provider.providerName}: ${percentage.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {providers.map((provider, index) => {
            const percentage = totalCost > 0 ? (provider.totalCost / totalCost) * 100 : 0;
            return (
              <div key={provider.providerName} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${colors[index % colors.length].bg}`} />
                  <span className="text-gray-700">{provider.providerName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{provider.orderCount} orders</span>
                  <span className="font-medium text-gray-900">
                    ${provider.totalCost.toFixed(2)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CO2 Distribution */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Carbon Emissions by Provider</h3>

        {/* Visual Bar */}
        <div className="h-8 rounded-lg overflow-hidden flex mb-4">
          {providers.map((provider, index) => {
            const percentage = totalCO2e > 0 ? (provider.totalCO2e / totalCO2e) * 100 : 0;
            if (percentage < 1) return null;
            return (
              <div
                key={provider.providerName}
                className={`${colors[index % colors.length].bg} transition-all`}
                style={{ width: `${percentage}%` }}
                title={`${provider.providerName}: ${percentage.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {providers.map((provider, index) => {
            const percentage = totalCO2e > 0 ? (provider.totalCO2e / totalCO2e) * 100 : 0;
            return (
              <div key={provider.providerName} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${colors[index % colors.length].bg}`} />
                  <span className="text-gray-700">{provider.providerName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{provider.orderCount} orders</span>
                  <span className="font-medium text-gray-900">
                    {provider.totalCO2e.toFixed(2)} kg ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Efficiency Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2">Provider</th>
                <th className="pb-2 text-right">Orders</th>
                <th className="pb-2 text-right">Avg Cost</th>
                <th className="pb-2 text-right">Total CO2e</th>
                <th className="pb-2 text-right">CO2e/Order</th>
                <th className="pb-2 text-right">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {providers.map((provider, index) => {
                const co2ePerOrder = provider.orderCount > 0 ? provider.totalCO2e / provider.orderCount : 0;
                const costPerCO2e = provider.totalCO2e > 0 ? provider.totalCost / provider.totalCO2e : 0;

                return (
                  <tr key={provider.providerName}>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded ${colors[index % colors.length].bg}`} />
                        {provider.providerName}
                      </div>
                    </td>
                    <td className="py-2 text-right">{provider.orderCount}</td>
                    <td className="py-2 text-right">${provider.avgCostPerOrder.toFixed(2)}</td>
                    <td className="py-2 text-right">{provider.totalCO2e.toFixed(2)} kg</td>
                    <td className="py-2 text-right">{co2ePerOrder.toFixed(3)} kg</td>
                    <td className="py-2 text-right">
                      <span className={costPerCO2e < 50 ? 'text-green-600' : costPerCO2e < 100 ? 'text-yellow-600' : 'text-red-600'}>
                        ${costPerCO2e.toFixed(2)}/kg
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
