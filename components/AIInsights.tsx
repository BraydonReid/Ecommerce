'use client';

import { useState } from 'react';

interface AIInsightsProps {
  period: string;
}

export default function AIInsights({ period }: AIInsightsProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error generating insights:', error);
      alert('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          🤖 AI-Powered Insights
          <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
            PREMIUM
          </span>
        </h3>
        {!insights && (
          <button
            onClick={generateInsights}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Insights'}
          </button>
        )}
      </div>

      {insights ? (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
            <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {insights.recommendations}
            </div>
          </div>
          <button
            onClick={generateInsights}
            disabled={loading}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Regenerate Insights
          </button>
        </div>
      ) : (
        <p className="text-gray-600">
          Click "Generate Insights" to get AI-powered analysis and recommendations based on your
          sustainability metrics.
        </p>
      )}
    </div>
  );
}
