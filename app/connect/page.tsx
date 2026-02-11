'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConnectStore() {
  const router = useRouter();
  const [shopDomain, setShopDomain] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Clean up the shop domain
    let shop = shopDomain.trim().toLowerCase();

    // Remove https:// or http://
    shop = shop.replace(/^https?:\/\//, '');

    // Remove trailing slash
    shop = shop.replace(/\/$/, '');

    // If they just entered the subdomain, add .myshopify.com
    if (!shop.includes('.')) {
      shop = `${shop}.myshopify.com`;
    }

    // Validate shop domain
    if (!shop.endsWith('.myshopify.com') && !shop.includes('.')) {
      setError('Please enter a valid Shopify store domain (e.g., mystore.myshopify.com)');
      setIsLoading(false);
      return;
    }

    // Redirect to OAuth flow
    window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(shop)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-green-primary mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🌱</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Connect Your Shopify Store
            </h1>
            <p className="text-gray-600">
              Enter your store domain to start tracking your carbon footprint
            </p>
          </div>

          <form onSubmit={handleConnect} className="space-y-6">
            <div>
              <label htmlFor="shop" className="block text-sm font-medium text-gray-700 mb-2">
                Shopify Store Domain
              </label>
              <input
                type="text"
                id="shop"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="mystore.myshopify.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent text-gray-900"
                required
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-gray-500">
                You can also just enter your store name (e.g., "mystore")
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-primary text-white py-3 rounded-lg font-semibold hover:bg-green-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect Store'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Need help? Check out our{' '}
              <Link href="/help/setup" className="text-green-primary hover:underline font-semibold">
                Setup Guide
              </Link>{' '}
              or{' '}
              <Link href="/demo" className="text-green-primary hover:underline font-semibold">
                view the demo
              </Link>
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
          <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-primary mr-2">1.</span>
              You'll be redirected to Shopify to authorize the connection
            </li>
            <li className="flex items-start">
              <span className="text-green-primary mr-2">2.</span>
              We'll securely access your order and product data
            </li>
            <li className="flex items-start">
              <span className="text-green-primary mr-2">3.</span>
              Your dashboard will be ready with carbon tracking analytics
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
