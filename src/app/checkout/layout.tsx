import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order breathEN — 99% Pure Oxygen Canister',
  description: 'Order breathEN oxygen canisters. Fast delivery across India.',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
