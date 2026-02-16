'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, tier: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(tier);

    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your business
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Tier */}
          <div className="bg-green-primary text-white rounded-lg shadow-xl p-8 transform scale-105">
            <div className="text-sm bg-white text-green-primary px-3 py-1 rounded-full inline-block mb-2">
              RECOMMENDED
            </div>
            <h3 className="text-2xl font-bold mb-2">Basic</h3>
            <p className="text-4xl font-bold mb-4">$29/mo</p>
            <p className="text-green-100 mb-6">For growing businesses</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Up to 2,000 orders/month
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Full dashboard & analytics
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                PDF reports
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Email support
              </li>
            </ul>
            <button
              onClick={() =>
                handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!, 'basic')
              }
              disabled={loading === 'basic'}
              className="w-full bg-white text-green-primary py-3 rounded-lg font-semibold hover:bg-green-50 disabled:opacity-50"
            >
              {loading === 'basic' ? 'Loading...' : 'Get Started'}
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-2">Premium</h3>
            <p className="text-4xl font-bold text-green-primary mb-4">$50/mo</p>
            <p className="text-gray-600 mb-6">For serious sustainability</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-primary mr-2">✓</span>
                Unlimited orders
              </li>
              <li className="flex items-start">
                <span className="text-green-primary mr-2">✓</span>
                AI insights & recommendations
              </li>
              <li className="flex items-start">
                <span className="text-green-primary mr-2">✓</span>
                Advanced analytics
              </li>
              <li className="flex items-start">
                <span className="text-green-primary mr-2">✓</span>
                Priority support
              </li>
            </ul>
            <button
              onClick={() =>
                handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!, 'premium')
              }
              disabled={loading === 'premium'}
              className="w-full bg-green-primary text-white py-3 rounded-lg font-semibold hover:bg-green-secondary disabled:opacity-50"
            >
              {loading === 'premium' ? 'Loading...' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
