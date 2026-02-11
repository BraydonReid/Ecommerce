'use client';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
          }}
        >
          <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '520px' }}>
            <h1 style={{ color: '#111827', marginBottom: '1rem' }}>Something went wrong</h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              An unexpected error has occurred. Please refresh the page or return
              to the homepage.
            </p>
            {error?.digest && (
              <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Error ID: {error.digest}
              </p>
            )}
            <a
              href="/"
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
