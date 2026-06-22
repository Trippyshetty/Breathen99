'use client';
import dynamic from 'next/dynamic';

// Load the entire checkout UI client-side only — guarantees zero SSR/prerender
// for this route, which was causing the "client-side exception" crash.
const CheckoutClient = dynamic(() => import('@/components/CheckoutClient'), { ssr: false });

export default function CheckoutPage() {
  return <CheckoutClient />;
}
