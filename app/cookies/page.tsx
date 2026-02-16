import Link from 'next/link';

export default function CookiePolicyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>

        <div className="bg-white rounded-lg shadow-md p-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> February 15, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small text files stored on your device when you visit a website.
              They help the website remember your preferences and provide a better user experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Cookies We Use</h2>
            <p className="text-gray-600 mb-4">
              GreenCommerce uses only essential cookies required for the application to function:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-600 mb-4">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-semibold">Cookie Name</th>
                    <th className="py-2 pr-4 font-semibold">Purpose</th>
                    <th className="py-2 pr-4 font-semibold">Duration</th>
                    <th className="py-2 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-sm">next-auth.session-token</td>
                    <td className="py-2 pr-4">Keeps you signed in to your account</td>
                    <td className="py-2 pr-4">Session</td>
                    <td className="py-2">Essential</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-sm">next-auth.csrf-token</td>
                    <td className="py-2 pr-4">Prevents cross-site request forgery attacks</td>
                    <td className="py-2 pr-4">Session</td>
                    <td className="py-2">Essential</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-sm">shopify_oauth_state</td>
                    <td className="py-2 pr-4">Validates the Shopify OAuth flow (set during store connection only)</td>
                    <td className="py-2 pr-4">10 minutes</td>
                    <td className="py-2">Essential</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Third-Party Cookies</h2>
            <p className="text-gray-600 mb-4">
              We do not use any third-party tracking cookies, advertising cookies, or analytics cookies.
              The only third-party service that may set cookies is Stripe, our payment processor,
              which uses cookies strictly for payment security and fraud prevention during the checkout process.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Managing Cookies</h2>
            <p className="text-gray-600 mb-4">
              You can manage cookies through your browser settings. Please note that disabling essential
              cookies will prevent you from using GreenCommerce, as they are required for authentication
              and security.
            </p>
            <p className="text-gray-600">
              Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
              <li>View what cookies are stored on your device</li>
              <li>Delete individual or all cookies</li>
              <li>Block cookies from specific or all websites</li>
              <li>Set preferences for first-party vs third-party cookies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Contact</h2>
            <p className="text-gray-600">
              If you have questions about our cookie policy, contact us at:{' '}
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
