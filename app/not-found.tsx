import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-bold text-green-primary">404</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-green-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-secondary transition"
          >
            Go to Homepage
          </Link>
          <Link
            href="/dashboard"
            className="block w-full bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/demo" className="text-green-primary hover:text-green-secondary">
              View Demo
            </Link>
            <Link href="/pricing" className="text-green-primary hover:text-green-secondary">
              Pricing
            </Link>
            <Link href="/connect" className="text-green-primary hover:text-green-secondary">
              Connect Store
            </Link>
            <Link href="/login" className="text-green-primary hover:text-green-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
