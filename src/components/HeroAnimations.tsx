'use client';
import { useEffect } from 'react';

export default function HeroAnimations() {
  useEffect(() => {
    // Curtain dismiss
    const curtainEl = document.getElementById('curtain');
    const dismissCurtain = () => {
      if (!curtainEl) return;
      curtainEl.classList.add('fade-out');
      setTimeout(() => curtainEl.remove(), 550);
    };
    if (document.readyState === 'complete') setTimeout(dismissCurtain, 300);
    else {
      window.addEventListener('load', () => setTimeout(dismissCurtain, 300));
      setTimeout(dismissCurtain, 3000);
    }

    const initGSAP = async () => {
      const gsapModule = await import('gsap');
      const { gsap } = gsapModule;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const { ScrollToPlugin } = await import('gsap/ScrollToPlugin');
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

      const tl = gsap.timeline({ delay: 0.4 });
      tl.from('.hero-eyebrow', { opacity:0, y:20, duration:0.6, ease:'power2.out' })
        .from('.hero-h1', { opacity:0, y:40, duration:0.8, ease:'power3.out' }, '-=0.3')
        .from('.hero-body', { opacity:0, y:20, duration:0.6, ease:'power2.out' }, '-=0.4')
        .from('.hero-price', { opacity:0, y:20, duration:0.5, ease:'power2.out' }, '-=0.3')
        .from('.hero-ctas', { opacity:0, y:20, duration:0.5, ease:'power2.out' }, '-=0.3')
        .from('.hero-trust', { opacity:0, y:16, duration:0.5, ease:'power2.out' }, '-=0.2')
        .from('.product-stage', { opacity:0, scale:0.92, duration:0.9, ease:'power3.out' }, 0.3);

      gsap.to('#product-wrap', { y:-14, duration:3.5, ease:'sine.inOut', repeat:-1, yoyo:true });

      gsap.utils.toArray<HTMLElement>('.why-card, .callout-card, .testimonial-card, .faq-item').forEach(el => {
        gsap.from(el, {
          scrollTrigger: { trigger:el, start:'top 85%', once:true },
          opacity:0, y:30, duration:0.7, ease:'power2.out',
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target || '0', 10);
        const suffix = el.dataset.suffix || '';
        gsap.fromTo(el,
          { innerText: 0 },
          {
            innerText: target, duration:2, ease:'power2.out',
            snap: { innerText:1 },
            scrollTrigger: { trigger:el, start:'top 80%', once:true },
            onUpdate() { el.innerText = Math.round(parseFloat(el.innerText)) + suffix; },
          }
        );
      });

      gsap.to('.orbit-ring', { rotation:360, duration:20, repeat:-1, ease:'none', transformOrigin:'50% 50%' });
      gsap.to('.orbit-ring-2', { rotation:-360, duration:14, repeat:-1, ease:'none', transformOrigin:'50% 50%' });

      const stickyBar = document.querySelector('.sticky-buy-bar') as HTMLElement;
      if (stickyBar) {
        ScrollTrigger.create({
          trigger: '#hero', start:'bottom 60%',
          onEnter: () => stickyBar.classList.add('visible'),
          onLeaveBack: () => stickyBar.classList.remove('visible'),
        });
      }

      document.querySelectorAll('.marquee-wrap').forEach(wrap => {
        wrap.addEventListener('mouseenter', () => (wrap.querySelector('.marquee-track') as HTMLElement)?.style.setProperty('animation-play-state','paused'));
        wrap.addEventListener('mouseleave', () => (wrap.querySelector('.marquee-track') as HTMLElement)?.style.setProperty('animation-play-state','running'));
      });
    };

    initGSAP();

    // Slideshow
    const track = document.getElementById('slideshow-track');
    let autoTimer: ReturnType<typeof setInterval> | null = null;
    if (track) {
      let current = 0;
      const slides = Array.from(track.querySelectorAll<HTMLElement>('.slide'));
      const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('.slide-dot'));

      const goTo = (idx: number) => {
        slides[current].classList.remove('active');
        dots[current]?.classList.remove('active');
        current = (idx + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current]?.classList.add('active');
      };

      document.querySelector('.slide-next')?.addEventListener('click', () => goTo(current + 1));
      document.querySelector('.slide-prev')?.addEventListener('click', () => goTo(current - 1));
      dots.forEach(d => d.addEventListener('click', () => goTo(parseInt(d.dataset.index || '0'))));
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }

    return () => { if (autoTimer) clearInterval(autoTimer); };
  }, []);

  return null;
}
