import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-green-primary">🌱 GreenCommerce</span>
          </div>
          <nav className="flex gap-6">
            <Link href="#features" className="text-gray-600 hover:text-green-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-green-primary">
              Pricing
            </Link>
            <Link href="/connect" className="text-green-primary font-semibold hover:text-green-secondary">
              Connect Store
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Track and Reduce Your Shopify Store's
          <span className="text-green-primary"> Carbon Footprint</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Turn sustainability into a competitive advantage. Our BI platform gives you clear insights
          into your e-commerce carbon emissions and actionable recommendations to go greener.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/connect"
            className="bg-green-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-secondary transition"
          >
            Get Started Free
          </Link>
          <Link
            href="#features"
            className="bg-white text-green-primary border-2 border-green-primary px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            Learn More
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4">Free 14-day trial • No credit card required</p>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔌</div>
            <h3 className="text-xl font-semibold mb-2">1. Connect Your Store</h3>
            <p className="text-gray-600">
              Install our app from the Shopify App Store. We securely connect to your store data.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">2. Analyze Emissions</h3>
            <p className="text-gray-600">
              We automatically calculate carbon emissions from shipping, packaging, and more.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-semibold mb-2">3. Take Action</h3>
            <p className="text-gray-600">
              Get AI-powered insights and recommendations to reduce your environmental impact.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-3xl">📈</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Dashboard</h3>
                <p className="text-gray-600">
                  Visualize your carbon footprint trends, breakdown by category, and top polluting products.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">🤖</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
                <p className="text-gray-600">
                  Get plain-English summaries and personalized recommendations powered by GPT-4.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">📄</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">PDF Reports</h3>
                <p className="text-gray-600">
                  Generate and download professional sustainability reports for stakeholders.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">🔔</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Automated Tracking</h3>
                <p className="text-gray-600">
                  Every order is automatically analyzed in real-time via webhooks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-4xl font-bold text-green-primary mb-4">$0</p>
            <p className="text-gray-600 mb-6">Perfect for small stores</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-primary mr-2">✓</span>
                Up to 100 orders/month
              </li>
              <li className="flex items-start">
                <span className="text-green-primary mr-2">✓</span>
                Basic dashboard
              </li>
              <li className="flex items-start">
                <span className="text-green-primary mr-2">✓</span>
                Carbon tracking
              </li>
            </ul>
            <Link
              href="/connect"
              className="block w-full text-center bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-green-primary text-white p-8 rounded-lg shadow-lg transform scale-105">
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
            <Link
              href="/connect"
              className="block w-full text-center bg-white text-green-primary py-2 rounded-lg font-semibold hover:bg-green-50"
            >
              Start Free Trial
            </Link>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-2">Premium</h3>
            <p className="text-4xl font-bold text-green-primary mb-4">$99/mo</p>
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
            <Link
              href="/connect"
              className="block w-full text-center bg-green-primary text-white py-2 rounded-lg font-semibold hover:bg-green-secondary"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">🌱 GreenCommerce</h3>
              <p className="text-gray-400">
                Making e-commerce more sustainable, one store at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GreenCommerce. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
