import Link from 'next/link';

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-primary">
              GreenCommerce
            </Link>
            <Link href="/login" className="text-green-primary hover:text-green-secondary font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">GDPR Compliance</h1>

        <div className="bg-white rounded-lg shadow-md p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> February 15, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Data We Collect</h2>
            <p className="text-gray-600 mb-4">
              GreenCommerce processes the following data from your Shopify store to provide carbon emission tracking and analytics:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Order data:</strong> Order numbers, prices, shipping addresses (city and country only), shipping methods, and product weights</li>
              <li><strong>Product data:</strong> Product titles, SKUs, and weights</li>
              <li><strong>Shipping data:</strong> Carrier names, service levels, and shipping costs</li>
              <li><strong>Account data:</strong> Your email address and store domain</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Legal Basis for Processing</h2>
            <p className="text-gray-600 mb-4">
              We process your data based on the following legal bases under the GDPR:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Contract performance:</strong> Processing necessary to provide the carbon tracking service you subscribed to</li>
              <li><strong>Legitimate interest:</strong> Improving our service and providing aggregated sustainability insights</li>
              <li><strong>Consent:</strong> For optional features like AI insights and email reports, which you can enable or disable at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your data for the following periods:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Active accounts:</strong> Data is retained while your account is active and the app is installed</li>
              <li><strong>After uninstall:</strong> Your access token is immediately revoked. All store data is deleted within 48 hours via Shopify&apos;s mandatory data deletion process</li>
              <li><strong>Billing records:</strong> Retained for 7 years as required by financial regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Your Rights</h2>
            <p className="text-gray-600 mb-4">
              Under the GDPR, you have the following rights:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Right of access:</strong> Request a copy of all data we hold about you</li>
              <li><strong>Right to rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to erasure:</strong> Request deletion of your data (also triggered automatically when you uninstall the app)</li>
              <li><strong>Right to restrict processing:</strong> Request that we limit how we use your data</li>
              <li><strong>Right to data portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to object:</strong> Object to processing based on legitimate interest</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. GDPR Webhooks</h2>
            <p className="text-gray-600 mb-4">
              GreenCommerce supports all mandatory Shopify GDPR webhooks:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Customer data request:</strong> When a customer requests their data, we compile all order and emission records associated with them</li>
              <li><strong>Customer data erasure:</strong> When a customer requests deletion, we redact all personally identifiable information from their orders</li>
              <li><strong>Shop data erasure:</strong> When you uninstall the app, all merchant data is permanently deleted</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We protect your data with industry-standard security measures:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>All data transmitted via HTTPS/TLS encryption</li>
              <li>Passwords hashed with bcrypt (12 salt rounds)</li>
              <li>Shopify webhook signatures verified via HMAC-SHA256</li>
              <li>OAuth state parameters validated to prevent CSRF attacks</li>
              <li>Rate limiting on authentication endpoints</li>
              <li>Session-based access control on all API endpoints</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contact</h2>
            <p className="text-gray-600">
              For GDPR-related inquiries or to exercise your rights, contact us at:{' '}
              <a href="mailto:privacy@greencommerce.io" className="text-green-primary hover:underline">
                privacy@greencommerce.io
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
