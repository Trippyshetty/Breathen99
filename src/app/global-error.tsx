'use client';

// Last-resort boundary: catches failures in the root layout itself, which a
// route-level error.tsx cannot reach. Must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('[global] render error:', error);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '64px 20px', textAlign: 'center', color: '#0a0a0a' }}>
          <h1 style={{ fontSize: '1.4rem', margin: '0 0 12px', fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: '#555', lineHeight: 1.6, margin: '0 0 28px' }}>
            No payment has been taken and no order has been placed.
          </p>
          <button
            onClick={reset}
            style={{ background: '#e8260a', color: '#fff', border: 'none', borderRadius: 3, padding: '14px 32px',
                     fontSize: '.88rem', fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Try again
          </button>
          <div style={{ marginTop: 20, fontSize: '.85rem' }}>
            <a href="https://wa.me/919819250202" style={{ color: '#e8260a', textDecoration: 'none' }}>
              Order on WhatsApp: +91 98192 50202
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
