import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'breathEN — World\'s First Nose Breathing Oxygen Canister | 99% Pure Oxygen',
  description:
    'breathEN is the world\'s first nose breathing oxygen canister with 99% pure recreational oxygen. Instant boost for fitness, travel, pollution & stress. No prescription needed. Ships across India.',
  keywords:
    'breathEN, oxygen canister, recreational oxygen, portable oxygen, 99% pure oxygen, nose breathing, oxygen boost, fitness oxygen, altitude sickness, pollution relief',
  openGraph: {
    title: 'breathEN — Pure 99% Oxygen. Anytime. Anywhere.',
    description:
      'World\'s first nose breathing oxygen canister. Instant refresh for urban living, fitness, travel & stress. Zero side effects.',
    images: ['/assets/product.png'],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" href="/assets/logo-white.jpg" as="image" />
        <link rel="preload" href="/assets/product.png" as="image" />
      </head>
      <body>{children}</body>
    </html>
  );
}
