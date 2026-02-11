'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Settings {
  defaultPackagingType: string;
  defaultPackagingWeight: number;
  enableAIInsights: boolean;
  emailReports: boolean;
  reportFrequency: string;
}

interface MerchantInfo {
  email: string;
  shopifyShop: string | null;
  subscriptionTier: string;
  stripeCustomerId: string | null;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');

  const [settings, setSettings] = useState<Settings>({
    defaultPackagingType: 'cardboard',
    defaultPackagingWeight: 0.1,
    enableAIInsights: false,
    emailReports: false,
    reportFrequency: 'monthly',
  });
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (status === 'unauthenticated' && !shop) {
      router.push('/login');
      return;
    }
    fetchSettings();
  }, [status, shop, router]);

  async function fetchSettings() {
    try {
      const url = shop ? `/api/settings?shop=${encodeURIComponent(shop)}` : '/api/settings';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      setMerchant(data.merchant);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const url = shop ? `/api/settings?shop=${encodeURIComponent(shop)}` : '/api/settings';
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? parseFloat(value) : value,
    }));
  }

  async function openBillingPortal() {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shop }),
      });

      if (!response.ok) {
        throw new Error('Failed to open billing portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to open billing portal' });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">
                {merchant?.shopifyShop || merchant?.email}
              </p>
            </div>
            <Link
              href={shop ? `/dashboard?shop=${shop}` : '/dashboard'}
              className="text-green-primary hover:text-green-secondary font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <p className="text-gray-500">{merchant?.email}</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium text-gray-700">Connected Store</p>
                  <p className="text-gray-500">{merchant?.shopifyShop || 'Not connected'}</p>
                </div>
                {!merchant?.shopifyShop && (
                  <Link
                    href="/connect"
                    className="text-green-primary hover:text-green-secondary font-medium"
                  >
                    Connect Store
                  </Link>
                )}
              </div>
              <div className="flex justify-between items-center py-3">
                <div>
                  <p className="font-medium text-gray-700">Subscription</p>
                  <p className="text-gray-500 capitalize">{merchant?.subscriptionTier} Plan</p>
                </div>
                <div className="flex gap-3">
                  {merchant?.subscriptionTier === 'free' && (
                    <Link
                      href={shop ? `/pricing?shop=${shop}` : '/pricing'}
                      className="bg-green-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-secondary transition"
                    >
                      Upgrade
                    </Link>
                  )}
                  {merchant?.stripeCustomerId && (
                    <button
                      type="button"
                      onClick={openBillingPortal}
                      className="text-green-primary hover:text-green-secondary font-medium text-sm"
                    >
                      Manage Billing
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Carbon Tracking Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Carbon Tracking Settings</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="defaultPackagingType" className="block text-sm font-medium text-gray-700 mb-2">
                  Default Packaging Type
                </label>
                <select
                  id="defaultPackagingType"
                  name="defaultPackagingType"
                  value={settings.defaultPackagingType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none"
                >
                  <option value="cardboard">Cardboard</option>
                  <option value="plastic">Plastic</option>
                  <option value="paper">Paper</option>
                  <option value="biodegradable">Biodegradable</option>
                  <option value="mixed">Mixed Materials</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  This will be used when packaging type is not specified for an order.
                </p>
              </div>

              <div>
                <label htmlFor="defaultPackagingWeight" className="block text-sm font-medium text-gray-700 mb-2">
                  Default Packaging Weight (kg)
                </label>
                <input
                  type="number"
                  id="defaultPackagingWeight"
                  name="defaultPackagingWeight"
                  value={settings.defaultPackagingWeight}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Average packaging weight used in calculations when not specified.
                </p>
              </div>
            </div>
          </div>

          {/* AI & Reports */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI & Reports</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Enable AI Insights</p>
                  <p className="text-sm text-gray-500">
                    Get AI-powered recommendations to reduce your carbon footprint
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    id="enableAIInsights"
                    name="enableAIInsights"
                    checked={settings.enableAIInsights}
                    onChange={handleChange}
                    disabled={merchant?.subscriptionTier === 'free'}
                    className="sr-only"
                  />
                  <label
                    htmlFor="enableAIInsights"
                    className={`block w-14 h-8 rounded-full transition-colors cursor-pointer ${
                      settings.enableAIInsights ? 'bg-green-primary' : 'bg-gray-300'
                    } ${merchant?.subscriptionTier === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.enableAIInsights ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></span>
                  </label>
                  {merchant?.subscriptionTier === 'free' && (
                    <span className="ml-2 text-xs text-orange-600">Premium only</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">Email Reports</p>
                  <p className="text-sm text-gray-500">
                    Receive periodic sustainability reports via email
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    id="emailReports"
                    name="emailReports"
                    checked={settings.emailReports}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="emailReports"
                    className={`block w-14 h-8 rounded-full transition-colors cursor-pointer ${
                      settings.emailReports ? 'bg-green-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.emailReports ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></span>
                  </label>
                </div>
              </div>

              {settings.emailReports && (
                <div>
                  <label htmlFor="reportFrequency" className="block text-sm font-medium text-gray-700 mb-2">
                    Report Frequency
                  </label>
                  <select
                    id="reportFrequency"
                    name="reportFrequency"
                    value={settings.reportFrequency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <h2 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">Disconnect Shopify Store</p>
                  <p className="text-sm text-gray-500">
                    Remove the connection to your Shopify store. Your data will be preserved.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                >
                  Disconnect
                </button>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="font-medium text-gray-700">Delete Account</p>
                  <p className="text-sm text-gray-500">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-secondary transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
