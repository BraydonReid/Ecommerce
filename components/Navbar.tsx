'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  merchantName?: string;
  shopifyShop?: string | null;
  subscriptionTier?: string;
  showSync?: boolean;
  onSync?: () => void;
  syncing?: boolean;
}

export default function Navbar({
  merchantName,
  shopifyShop,
  subscriptionTier = 'free',
  showSync = false,
  onSync,
  syncing = false,
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', requiresShop: true },
    { href: '/settings', label: 'Settings', requiresShop: true },
    { href: '/pricing', label: 'Pricing', requiresShop: false },
  ];

  const shopQuery = shopifyShop ? `?shop=${encodeURIComponent(shopifyShop)}` : '';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Store Name */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-primary">GreenCommerce</span>
            </Link>
            {merchantName && (
              <div className="hidden md:block">
                <p className="text-sm text-gray-600">{merchantName}</p>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.requiresShop ? `${link.href}${shopQuery}` : link.href}
                className={`font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-green-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {shopifyShop && (
              <a
                href={`/api/reports/pdf?shop=${encodeURIComponent(shopifyShop)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Download Report
              </a>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {showSync && onSync && (
              <button
                onClick={onSync}
                disabled={syncing}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Syncing...
                  </>
                ) : (
                  'Sync Orders'
                )}
              </button>
            )}

            {/* Subscription Badge */}
            <span
              className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                subscriptionTier === 'premium'
                  ? 'bg-purple-100 text-purple-800'
                  : subscriptionTier === 'basic'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {subscriptionTier.toUpperCase()}
            </span>

            {subscriptionTier === 'free' && (
              <Link
                href={`/pricing${shopQuery}`}
                className="hidden sm:block text-orange-600 hover:text-orange-700 font-semibold text-sm"
              >
                Upgrade
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.requiresShop ? `${link.href}${shopQuery}` : link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-medium py-2 ${
                    isActive(link.href)
                      ? 'text-green-primary'
                      : 'text-gray-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {shopifyShop && (
                <a
                  href={`/api/reports/pdf?shop=${encodeURIComponent(shopifyShop)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Download Report
                </a>
              )}

              {showSync && onSync && (
                <button
                  onClick={() => {
                    onSync();
                    setMobileMenuOpen(false);
                  }}
                  disabled={syncing}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {syncing ? 'Syncing...' : 'Sync Orders'}
                </button>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    subscriptionTier === 'premium'
                      ? 'bg-purple-100 text-purple-800'
                      : subscriptionTier === 'basic'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {subscriptionTier.toUpperCase()}
                </span>

                {subscriptionTier === 'free' && (
                  <Link
                    href={`/pricing${shopQuery}`}
                    className="text-orange-600 font-semibold text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
