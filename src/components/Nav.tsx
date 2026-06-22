'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const hamburger = hamburgerRef.current;
    const mobileNav = mobileNavRef.current;
    const backdrop = backdropRef.current;
    if (!nav || !hamburger || !mobileNav || !backdrop) return;

    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const openNav = () => {
      mobileNav.classList.add('open');
      backdrop.classList.add('open');
      hamburger.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
    };
    const closeNav = () => {
      mobileNav.classList.remove('open');
      backdrop.classList.remove('open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    };
    const toggleNav = () => (mobileNav.classList.contains('open') ? closeNav() : openNav());

    hamburger.addEventListener('click', toggleNav);
    backdrop.addEventListener('click', closeNav);

    // close on anchor click
    mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));

    // close on Escape
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeNav(); };
    document.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('scroll', onScroll);
      hamburger.removeEventListener('click', toggleNav);
      backdrop.removeEventListener('click', closeNav);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <>
      {/* Fixed logo bar */}
      <div className="logo-bar">
        <Image src="/assets/logo-white.jpg" className="logo-bar-img" alt="breathEN" width={160} height={40} />
        <button
          className="nav-hamburger"
          id="nav-hamburger"
          ref={hamburgerRef}
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="mobile-nav-overlay"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Desktop nav */}
      <nav ref={navRef}>
        <ul className="nav-links desktop-only">
          <li><a href="#about">About</a></li>
          <li><a href="#why">Who It Helps</a></li>
          <li><a href="#product">Product</a></li>
          <li><a href="#testimonials">Reviews</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><Link href="/checkout" className="nav-cta">Buy Now</Link></li>
        </ul>
      </nav>

      {/* Mobile nav backdrop */}
      <div className="mnav-backdrop" id="mnav-backdrop" ref={backdropRef} />

      {/* Mobile nav */}
      <div
        className="mobile-nav-overlay"
        id="mobile-nav-overlay"
        ref={mobileNavRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <ul className="mnav-links">
          <li><a href="#about" className="mnav-link">About</a></li>
          <li><a href="#why" className="mnav-link">Who It Helps</a></li>
          <li><a href="#product" className="mnav-link">Product</a></li>
          <li><a href="#testimonials" className="mnav-link">Reviews</a></li>
          <li><a href="#faq" className="mnav-link">FAQ</a></li>
          <li><Link href="/checkout" className="mnav-link mnav-link--cta">Order Now →</Link></li>
        </ul>
      </div>
    </>
  );
}
