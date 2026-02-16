import Link from 'next/link';

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="bg-white rounded-lg shadow-md p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> February 15, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              GreenCommerce (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our Shopify application and related services (the &quot;Service&quot;).
            </p>
            <p className="text-gray-600 mb-4">
              By installing our app or creating an account, you agree to the collection and use of
              information as described in this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-lg font-medium text-gray-800 mb-3">2.1 Account Information</h3>
            <p className="text-gray-600 mb-4">
              When you create a GreenCommerce account, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Email address</li>
              <li>Password (stored as a bcrypt hash — we never store plaintext passwords)</li>
              <li>Store name (optional)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-3">2.2 Shopify Store Data</h3>
            <p className="text-gray-600 mb-4">
              When you connect your Shopify store via OAuth, we request the following scopes:
              <code className="text-sm bg-gray-100 px-1 rounded">read_orders</code>,{' '}
              <code className="text-sm bg-gray-100 px-1 rounded">read_products</code>, and{' '}
              <code className="text-sm bg-gray-100 px-1 rounded">read_shipping</code>. We access:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li><strong>Order data:</strong> Order numbers, prices, line items, shipping addresses (city and country only), shipping methods, and fulfillment details</li>
              <li><strong>Product data:</strong> Product titles, SKUs, weights, and categories</li>
              <li><strong>Shipping data:</strong> Carrier names, service levels, and shipping costs</li>
              <li><strong>Store metadata:</strong> Your Shopify store domain</li>
            </ul>
            <p className="text-gray-600 mb-4">
              We do <strong>not</strong> access customer email addresses, full street addresses, payment details,
              or any data beyond the scopes listed above.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mb-3">2.3 Payment Information</h3>
            <p className="text-gray-600 mb-4">
              Subscription payments are processed securely by Stripe. We do not store your credit card
              number, CVC, or billing address. Stripe&apos;s privacy policy governs their handling of your
              payment data.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mb-3">2.4 Automatically Collected Information</h3>
            <p className="text-gray-600 mb-4">
              We collect minimal technical information necessary to operate the Service:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>IP address (used for rate limiting and security only)</li>
              <li>Browser type and version (from standard HTTP headers)</li>
            </ul>
            <p className="text-gray-600 mb-4">
              We do <strong>not</strong> use third-party analytics, advertising trackers, or any
              non-essential tracking technologies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use the data we collect to:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Calculate carbon emissions for your shipping and orders</li>
              <li>Display sustainability analytics on your dashboard</li>
              <li>Generate PDF reports and AI-powered insights (when you opt in)</li>
              <li>Compare shipping providers by cost, speed, and carbon footprint</li>
              <li>Process your subscription payments via Stripe</li>
              <li>Send password reset emails (when requested)</li>
              <li>Protect our Service from abuse via rate limiting</li>
            </ul>
            <p className="text-gray-600 mb-4">
              We do <strong>not</strong> use your data for advertising, profiling, or any purpose
              unrelated to providing the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-600 mb-4">
              We share your information only with the following third parties, and only to the
              extent necessary to operate the Service:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li><strong>Stripe:</strong> Payment processing for subscriptions</li>
              <li><strong>Vercel:</strong> Application hosting and infrastructure</li>
              <li><strong>Supabase:</strong> Database hosting (PostgreSQL)</li>
              <li><strong>OpenAI:</strong> AI insights generation (only when you explicitly request AI insights; we send aggregated order data, not personal information)</li>
              <li><strong>Resend:</strong> Transactional emails (password resets only)</li>
            </ul>
            <p className="text-gray-600 mb-4">
              We do <strong>not</strong> sell, rent, or trade your personal information to any third party.
            </p>
            <p className="text-gray-600 mb-4">
              We may disclose your information if required by law, court order, or governmental
              regulation, or to protect our rights, property, or the safety of our users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement the following security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>All data is transmitted over HTTPS/TLS encryption</li>
              <li>Passwords are hashed using bcrypt with 12 salt rounds</li>
              <li>Shopify OAuth uses cryptographically secure state parameters to prevent CSRF attacks</li>
              <li>Shopify webhook payloads are verified via HMAC-SHA256 signatures</li>
              <li>Authentication endpoints are rate-limited to prevent brute-force attacks</li>
              <li>Session-based access control on all API endpoints</li>
              <li>Database hosted on Supabase with row-level encryption at rest</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your data according to the following schedule:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li><strong>Active accounts:</strong> Your data is retained for as long as your account is active and the app is installed on your Shopify store</li>
              <li><strong>App uninstall:</strong> When you uninstall GreenCommerce from your Shopify store, your Shopify access token is immediately revoked and your account is deactivated. All store data is permanently deleted within 48 hours via our automated data erasure process</li>
              <li><strong>Account deletion:</strong> You may request complete deletion of your account and all associated data at any time by contacting us</li>
              <li><strong>Billing records:</strong> Retained for 7 years as required by applicable financial regulations</li>
              <li><strong>Password reset tokens:</strong> Automatically expire after 1 hour</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
            <p className="text-gray-600 mb-4">
              GreenCommerce uses only essential cookies required for the application to function.
              We do not use any advertising, analytics, or tracking cookies.
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li><strong>next-auth.session-token:</strong> Keeps you signed in (session duration)</li>
              <li><strong>next-auth.csrf-token:</strong> Prevents cross-site request forgery (session duration)</li>
              <li><strong>shopify_oauth_state:</strong> Validates the Shopify OAuth flow (10-minute expiry, set only during store connection)</li>
            </ul>
            <p className="text-gray-600 mb-4">
              For more details, see our{' '}
              <Link href="/cookies" className="text-green-primary hover:underline">
                Cookie Policy
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
            <p className="text-gray-600 mb-4">
              Depending on your jurisdiction, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li><strong>Right of access:</strong> Request a copy of all personal data we hold about you</li>
              <li><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Right to erasure:</strong> Request deletion of your personal data (also triggered automatically when you uninstall the app)</li>
              <li><strong>Right to data portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to restrict processing:</strong> Request that we limit how we process your data</li>
              <li><strong>Right to object:</strong> Object to processing based on our legitimate interests</li>
              <li><strong>Right to withdraw consent:</strong> Withdraw consent at any time for optional features like AI insights</li>
            </ul>
            <p className="text-gray-600 mb-4">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:privacy@greencommerce.io" className="text-green-primary hover:underline">
                privacy@greencommerce.io
              </a>. We will respond within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Shopify GDPR Compliance</h2>
            <p className="text-gray-600 mb-4">
              GreenCommerce fully supports Shopify&apos;s mandatory GDPR webhooks:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li><strong>Customer data request:</strong> When a customer requests their data, we compile all order and emission records associated with them</li>
              <li><strong>Customer data erasure:</strong> When a customer requests deletion, we redact all personally identifiable information from their order records</li>
              <li><strong>Shop data erasure:</strong> When you uninstall the app, all merchant data including orders, emissions records, and account information is permanently deleted</li>
            </ul>
            <p className="text-gray-600 mb-4">
              For more details, see our{' '}
              <Link href="/gdpr" className="text-green-primary hover:underline">
                GDPR Compliance
              </Link>{' '}page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
            <p className="text-gray-600 mb-4">
              Your data may be processed in the United States, where our hosting infrastructure is located.
              If you are located outside the United States, your data will be transferred to and processed
              in the United States. We rely on standard contractual clauses and our service providers&apos;
              compliance frameworks (including SOC 2 certifications) to ensure adequate protection of
              your data during international transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Children&apos;s Privacy</h2>
            <p className="text-gray-600 mb-4">
              Our Service is designed for business use and is not intended for children under the age of 16.
              We do not knowingly collect personal information from children under 16. If we become aware
              that we have collected data from a child under 16, we will delete it promptly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of material changes
              by posting the updated policy on this page and updating the &quot;Last updated&quot; date.
              For significant changes, we will also notify you via the email address associated with your account.
              Your continued use of the Service after changes take effect constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              For questions about this Privacy Policy, to exercise your data rights, or to report a
              privacy concern:
            </p>
            <p className="text-gray-600">
              Email:{' '}
              <a href="mailto:privacy@greencommerce.io" className="text-green-primary hover:underline">
                privacy@greencommerce.io
              </a>
            </p>
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
