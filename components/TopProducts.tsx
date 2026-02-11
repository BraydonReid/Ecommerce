'use client';

interface TopProductsProps {
  products: Array<{
    name: string;
    emissions: number;
  }>;
}

export default function TopProducts({ products }: TopProductsProps) {
  const maxEmissions = Math.max(...products.map((p) => p.emissions));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Top Emitting Products</h3>
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">{product.name}</span>
              <span className="text-sm text-gray-600">{product.emissions.toFixed(2)} kg CO₂e</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-primary h-2 rounded-full"
                style={{ width: `${(product.emissions / maxEmissions) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
