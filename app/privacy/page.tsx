import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <strong>Last updated:</strong> January 1, 2024
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              GreenCommerce Intelligence (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-lg font-medium text-gray-800 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Account information (email address, name, password)</li>
              <li>Business information (store name, industry)</li>
              <li>Payment information (processed securely via Stripe)</li>
              <li>Communications with our support team</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-3">2.2 Information from Shopify</h3>
            <p className="text-gray-600 mb-4">
              When you connect your Shopify store, we access:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Order information (order details, shipping addresses, fulfillment data)</li>
              <li>Product information (titles, weights, categories)</li>
              <li>Store settings relevant to carbon calculations</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-3">2.3 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Provide and maintain our Service</li>
              <li>Calculate carbon emissions for your orders</li>
              <li>Generate sustainability reports and insights</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send service-related communications</li>
              <li>Improve and optimize our Service</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-600 mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li><strong>Service Providers:</strong> Third parties that help us operate our Service (hosting, analytics, payment processing)</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>With Your Consent:</strong> For any other purpose with your explicit consent</li>
            </ul>
            <p className="text-gray-600 mb-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational measures to protect your data, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Secure data centers and infrastructure</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your data for as long as your account is active or as needed to provide you services.
              After account deletion, we may retain certain data for legal compliance or legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Export your data</li>
              <li>Object to or restrict processing</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="text-gray-600 mb-4">
              To exercise these rights, contact us at privacy@greencommerce.io.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Maintain your session and preferences</li>
              <li>Analyze usage patterns</li>
              <li>Improve our Service</li>
            </ul>
            <p className="text-gray-600 mb-4">
              You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-600 mb-4">
              Your data may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-gray-600 mb-4">
              Our Service is not intended for children under 16. We do not knowingly collect
              information from children under 16.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy periodically. We will notify you of significant
              changes via email or through the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              For questions about this Privacy Policy or our data practices:
            </p>
            <p className="text-gray-600">
              Email: privacy@greencommerce.io<br />
              Address: 123 Sustainability Way, San Francisco, CA 94102
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
