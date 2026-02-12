'use client';

import { ShippingCostsSummary } from '@/types';

interface ShippingMetricsCardsProps {
  summary: ShippingCostsSummary;
}

export default function ShippingMetricsCards({ summary }: ShippingMetricsCardsProps) {
  const metrics = [
    {
      title: 'Total Shipping Spend',
      value: `$${summary.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${summary.totalOrders} orders`,
      icon: '💰',
      color: 'blue',
    },
    {
      title: 'Avg Cost / Order',
      value: `$${summary.avgCostPerOrder.toFixed(2)}`,
      subtitle: 'Per shipment',
      icon: '📊',
      color: 'indigo',
    },
    {
      title: 'Shipping CO2e',
      value: `${summary.totalCO2e.toFixed(2)} kg`,
      subtitle: `${summary.avgCO2ePerOrder.toFixed(3)} kg/order`,
      icon: '🌍',
      color: 'green',
    },
    {
      title: 'Carbon / Dollar',
      value: `${(summary.carbonPerDollar * 1000).toFixed(1)} g`,
      subtitle: 'CO2e per $ spent',
      icon: '⚖️',
      color: 'emerald',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const colors = colorClasses[metric.color];
        return (
          <div
            key={index}
            className={`${colors.bg} ${colors.border} border rounded-lg p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
            <p className={`text-xl font-bold ${colors.text}`}>{metric.value}</p>
            <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}
