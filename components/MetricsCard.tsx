'use client';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function MetricsCard({
  title,
  value,
  subtitle,
  change,
  icon,
  trend,
}: MetricsCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-red-600';
    if (trend === 'down') return 'text-green-600';
    if (change !== undefined) {
      return change > 0 ? 'text-red-600' : 'text-green-600';
    }
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <p className={`text-sm mt-2 ${getTrendColor()}`}>
              {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change).toFixed(1)}% from last period
            </p>
          )}
        </div>
        <div className="text-3xl ml-4">{icon}</div>
      </div>
    </div>
  );
}
