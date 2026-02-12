'use client';

import { useState, useEffect } from 'react';

interface SavingsCalculatorProps {
  costWeight: number;
  carbonWeight: number;
  onWeightChange: (costWeight: number, carbonWeight: number) => void;
  potentialSavings: {
    cost: number;
    co2e: number;
  };
}

export default function SavingsCalculator({
  costWeight,
  carbonWeight,
  onWeightChange,
  potentialSavings,
}: SavingsCalculatorProps) {
  const [localCostWeight, setLocalCostWeight] = useState(costWeight);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLocalCostWeight(costWeight);
  }, [costWeight]);

  const handleSliderChange = (value: number) => {
    setLocalCostWeight(value);
    setIsDirty(true);
  };

  const handleApply = () => {
    onWeightChange(localCostWeight, 100 - localCostWeight);
    setIsDirty(false);
  };

  const localCarbonWeight = 100 - localCostWeight;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Optimization Preferences</h3>
          <p className="text-sm text-gray-600">
            Adjust the slider to prioritize cost savings or carbon reduction
          </p>
        </div>
        {isDirty && (
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-green-primary text-white text-sm rounded-lg hover:bg-green-secondary transition"
          >
            Apply Changes
          </button>
        )}
      </div>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className={`font-medium ${localCostWeight > 50 ? 'text-blue-600' : 'text-gray-500'}`}>
            💰 Cost Priority ({localCostWeight}%)
          </span>
          <span className={`font-medium ${localCarbonWeight > 50 ? 'text-green-600' : 'text-gray-500'}`}>
            🌱 Carbon Priority ({localCarbonWeight}%)
          </span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={localCostWeight}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${localCostWeight}%, #10b981 ${localCostWeight}%, #10b981 100%)`,
            }}
          />
          <style jsx>{`
            input[type='range']::-webkit-slider-thumb {
              appearance: none;
              width: 24px;
              height: 24px;
              background: white;
              border: 3px solid #1f2937;
              border-radius: 50%;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            input[type='range']::-moz-range-thumb {
              width: 24px;
              height: 24px;
              background: white;
              border: 3px solid #1f2937;
              border-radius: 50%;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
          `}</style>
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>All Cost</span>
          <span>Balanced</span>
          <span>All Carbon</span>
        </div>
      </div>

      {/* Potential Savings Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💰</span>
            <span className="text-sm text-gray-600">Potential Cost Savings</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            ${potentialSavings.cost.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">per month based on current volume</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🌱</span>
            <span className="text-sm text-gray-600">Potential CO2 Reduction</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {potentialSavings.co2e.toFixed(2)} kg
          </p>
          <p className="text-xs text-gray-500">per month based on current volume</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          {localCostWeight > 60
            ? 'Your recommendations will prioritize cost savings over carbon reduction.'
            : localCarbonWeight > 60
            ? 'Your recommendations will prioritize carbon reduction over cost savings.'
            : 'Your recommendations will balance cost savings and carbon reduction equally.'}
        </p>
      </div>
    </div>
  );
}
