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
    <html lang="en" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        {/*
          Google Translate rewrites text nodes into <font> wrappers. If it runs
          before React hydrates, React's reconciler later tries to remove or
          reorder nodes that are no longer where it left them, and the DOM throws
          NotFoundError from removeChild. That happens at the document root, so
          it takes down the whole page rather than one component.

          The meta tag and translate="no" above are the real fix. This patch is
          the safety net for the cases they do not cover — a reader mode, an
          in-app browser, or a user explicitly choosing "Translate this page".
          It only changes behaviour in the exact case that would otherwise throw:
          the node is not a child of the parent React thinks it belongs to.

          Must run before hydration, so it is inline in <head>.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: `
(function(){
  if (typeof Node !== 'function' || !Node.prototype) return;

  var realRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    if (child && child.parentNode !== this) {
      try { window.__domPatchHits = (window.__domPatchHits || 0) + 1; } catch (e) {}
      return child;
    }
    return realRemoveChild.apply(this, arguments);
  };

  var realInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      try { window.__domPatchHits = (window.__domPatchHits || 0) + 1; } catch (e) {}
      return newNode;
    }
    return realInsertBefore.apply(this, arguments);
  };
})();
` }}
        />
        {/* TEMPORARY: capture errors that fire before React's boundary sees them. */}
        <script
          dangerouslySetInnerHTML={{ __html: `
(function(){
  window.__earlyErrors = window.__earlyErrors || [];
  function rec(o){ try { if (window.__earlyErrors.length < 20) window.__earlyErrors.push(o); } catch (e) {} }
  window.addEventListener('error', function(e){
    rec({ kind:'error', msg:(e && e.message) || String(e), src:e && e.filename,
          line:e && e.lineno, col:e && e.colno, stack:e && e.error && e.error.stack });
  }, true);
  window.addEventListener('unhandledrejection', function(e){
    var r = e && e.reason;
    rec({ kind:'unhandledrejection', msg:(r && r.message) || String(r), stack:r && r.stack });
  });
})();
` }}
        />
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
