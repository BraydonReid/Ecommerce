'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-8">
          We apologize for the inconvenience. An unexpected error has occurred.
          {error.digest && (
            <span className="block mt-2 text-sm text-gray-500">
              Error ID: {error.digest}
            </span>
          )}
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-green-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-secondary transition"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Go to Homepage
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          If this problem persists, please{' '}
          <a
            href="mailto:support@greencommerce.io"
            className="text-green-primary hover:text-green-secondary"
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
