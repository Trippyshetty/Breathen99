'use client';

import { useEffect } from 'react';
import ErrorDiagnostics from '@/components/ErrorDiagnostics';
import { EMAIL_ORDER_ISSUE, WHATSAPP_ORDER_ISSUE } from '@/lib/contact';

// Route-level error boundary. If anything in the checkout tree throws, the
// customer gets a usable page with a way out instead of Next's bare
// "Application error: a client-side exception has occurred" white screen.
export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[checkout] render error:', error);
  }, [error]);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 20px', textAlign: 'center',
                  fontFamily: 'DM Sans, system-ui, -apple-system, Segoe UI, Roboto, sans-serif', color: '#0a0a0a' }}>
      <h1 style={{ fontSize: '1.4rem', margin: '0 0 12px', fontWeight: 600 }}>
        We couldn&apos;t load the checkout
      </h1>
      <p style={{ color: '#555', lineHeight: 1.6, margin: '0 0 8px' }}>
        Something went wrong on this page. No payment has been taken and no order has been placed.
      </p>
      <p style={{ color: '#555', lineHeight: 1.6, margin: '0 0 28px' }}>
        Please try again, or order over WhatsApp and we&apos;ll take care of it.
      </p>

      <button
        onClick={reset}
        style={{ background: '#e8260a', color: '#fff', border: 'none', borderRadius: 3, padding: '14px 32px',
                 fontSize: '.88rem', fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}
      >
        Try again
      </button>

      <div style={{ marginTop: 20, fontSize: '.85rem' }}>
        <a href={WHATSAPP_ORDER_ISSUE} target="_blank" rel="noopener" style={{ color: '#e8260a', textDecoration: 'none' }}>
          Order on WhatsApp: +91 98192 50202
        </a>
      </div>
      <div style={{ marginTop: 10, fontSize: '.85rem' }}>
        <a href={EMAIL_ORDER_ISSUE} style={{ color: '#e8260a', textDecoration: 'none' }}>
          Or email info@breathen99.com
        </a>
      </div>
      <div style={{ marginTop: 24, fontSize: '.8rem' }}>
        <a href="/" style={{ color: '#999', textDecoration: 'none' }}>← Back to breathEN</a>
      </div>

      <ErrorDiagnostics boundary="checkout/error.tsx" error={error} />
    </div>
  );
}
