import Link from 'next/link';

export const metadata = {
  title: 'Setup Guide',
  description: 'Learn how to connect your Shopify store and start tracking your carbon footprint',
};

export default function SetupGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-primary">
              GreenCommerce
            </Link>
            <Link
              href="/connect"
              className="bg-green-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-secondary transition"
            >
              Connect Store
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Setup Guide</h1>

        <div className="space-y-8">
          {/* Step 1 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-green-primary text-white rounded-full flex items-center justify-center font-bold">
                1
              </span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Connect Your Shopify Store</h2>
                <p className="text-gray-600 mb-4">
                  Start by connecting your Shopify store to GreenCommerce. You&apos;ll need to authorize
                  our app to access your order and product data.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                  <li>Go to the <Link href="/connect" className="text-green-primary hover:underline">Connect Store</Link> page</li>
                  <li>Enter your Shopify store domain (e.g., mystore.myshopify.com)</li>
                  <li>Click &quot;Connect Store&quot; to start the authorization process</li>
                  <li>Approve the requested permissions in Shopify</li>
                  <li>You&apos;ll be redirected to your dashboard</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-green-primary text-white rounded-full flex items-center justify-center font-bold">
                2
              </span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Sync Your Historical Data</h2>
                <p className="text-gray-600 mb-4">
                  Once connected, sync your existing orders to start calculating carbon emissions.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                  <li>Click the &quot;Sync Orders&quot; button on your dashboard</li>
                  <li>Wait for the sync to complete (this may take a few minutes for large stores)</li>
                  <li>Your emissions data will appear in the charts and metrics</li>
                </ol>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> New orders will be automatically synced via webhooks.
                    You only need to manually sync for historical data.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-green-primary text-white rounded-full flex items-center justify-center font-bold">
                3
              </span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Configure Your Settings</h2>
                <p className="text-gray-600 mb-4">
                  Customize how GreenCommerce calculates emissions for your store.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li><strong>Default Packaging Type:</strong> Set your typical packaging material</li>
                  <li><strong>Default Packaging Weight:</strong> Average weight of your packaging</li>
                  <li><strong>Shipping Mode:</strong> Primary shipping method (road, air, sea, rail)</li>
                  <li><strong>Email Reports:</strong> Receive periodic sustainability reports</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Step 4 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-green-primary text-white rounded-full flex items-center justify-center font-bold">
                4
              </span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Explore Your Dashboard</h2>
                <p className="text-gray-600 mb-4">
                  Your dashboard provides insights into your store&apos;s carbon footprint:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li><strong>Total Emissions:</strong> Overall CO2e generated by your orders</li>
                  <li><strong>Shipping vs Packaging:</strong> Breakdown of emission sources</li>
                  <li><strong>Trends:</strong> 30-day emissions chart</li>
                  <li><strong>Top Products:</strong> Products with highest emissions</li>
                  <li><strong>AI Insights:</strong> Recommendations to reduce your footprint (Premium)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Troubleshooting</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Connection Failed</h3>
                <p className="text-gray-600 text-sm">
                  Make sure you&apos;re entering the correct store domain and that you have admin
                  access to the Shopify store.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">No Data Showing</h3>
                <p className="text-gray-600 text-sm">
                  Click the &quot;Sync Orders&quot; button to import your historical orders. It may take
                  a few minutes for large stores.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Emissions Seem Wrong</h3>
                <p className="text-gray-600 text-sm">
                  Check your Settings page to ensure the default packaging type and shipping mode
                  match your actual operations.
                </p>
              </div>
            </div>
          </section>

          {/* Need Help */}
          <section className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md p-6 text-white">
            <h2 className="text-xl font-semibold mb-3">Need More Help?</h2>
            <p className="mb-4 text-green-100">
              If you&apos;re still having issues, our support team is here to help.
            </p>
            <div className="flex gap-4">
              <a
                href="mailto:support@greencommerce.io"
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition"
              >
                Contact Support
              </a>
              <Link
                href="/demo"
                className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition"
              >
                View Demo
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-green-primary hover:text-green-secondary font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
