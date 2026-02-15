'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AdminSetup() {
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState('');
  const [shopDomain, setShopDomain] = useState('coolhomedecorandthemes.myshopify.com');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>
          <p className="text-gray-600 mb-4">Please sign in to access this page.</p>
          <Link href="/login" className="bg-green-600 text-white px-6 py-2 rounded-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: accessToken.trim(),
          shopDomain: shopDomain.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${result.error}`);
        return;
      }

      setMessage(`Token saved successfully for ${result.shopifyShop}! Redirecting to dashboard...`);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      setMessage('Error: Failed to save token. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-green-600 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin: Connect Shopify Token</h1>
          <p className="text-gray-600 mb-6">
            Manually enter your Shopify Admin API access token from a Custom App.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
            <strong>How to get the token:</strong>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Go to Shopify Admin &gt; Settings &gt; Apps &gt; Develop apps</li>
              <li>Create a custom app with read_orders, read_products, read_shipping scopes</li>
              <li>Install the app and copy the Admin API access token</li>
              <li>Paste it below</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Domain
              </label>
              <input
                type="text"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="mystore.myshopify.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin API Access Token
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="shpat_xxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Token starts with shpat_</p>
            </div>

            <button
              type="submit"
              disabled={saving || !accessToken.trim()}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Token & Connect'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
