import Image from 'next/image';
import { EMAIL_ENQUIRY, WHATSAPP_ENQUIRY } from '@/lib/contact';
import Link from 'next/link';
import Nav from '@/components/Nav';
import FAQ from '@/components/FAQ';
import HeroAnimations from '@/components/HeroAnimations';

export default function Home() {
  return (
    <>
      {/* Loading curtain */}
      <div id="curtain">
        <Image src="/assets/logo-white.jpg" id="curtain-logo" alt="breathEN" width={200} height={60} />
      </div>

      <Nav />

      {/* ── 1. HERO ── */}
      <section id="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            <span className="hero-eyebrow-text">World&apos;s First Nose Breathing Oxygen Canister</span>
          </div>
          <h1 className="hero-h1">
            <em>Comfortable<br />Breathing.</em><br />Anytime. Anywhere.
          </h1>
          <p className="hero-body">
            Pollution. Fatigue. Altitude. Stress. Your body loses oxygen silently every day.
            breathEN delivers 99% pure recreational oxygen — instantly, safely, anywhere.{' '}
            <strong>No prescription. No side effects. Just breath.</strong>
          </p>
          <div className="hero-price">
            <span className="hero-mrp">₹900</span>
            <span className="hero-sale">₹495</span>
            <span className="hero-save">45% OFF</span>
          </div>
          <div className="hero-ctas">
            <Link href="/checkout" className="btn-primary">Buy Now — ₹495</Link>
            <a href="https://www.youtube.com/shorts/T9LWqEXDPhE" target="_blank" rel="noopener" className="btn-secondary">
              Watch How It Works
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
          <div className="hero-trust">
            <div className="trust-item"><span className="trust-text">99% Pure O₂</span></div>
            <div className="trust-item"><span className="trust-text">Zero Side Effects</span></div>
            <div className="trust-item"><span className="trust-text">Upto 200 Shots per Can</span></div>
            <div className="trust-item"><span className="trust-text">Trusted by Fire Officers</span></div>
          </div>
        </div>

        <div className="hero-right">
          <canvas id="ray-canvas" />
          <canvas id="particle-canvas" />
          <div className="hero-bg-text" aria-hidden="true">O₂</div>
          <div className="product-stage">
            <div className="glow-core" />
            <div className="product-shadow" />
            <div className="orbit-ring" />
            <div className="orbit-ring-2" />
            <canvas id="molecule-canvas" />
            <div className="product-wrap" id="product-wrap">
              <Image src="/assets/product.png" alt="breathEN 99% pure oxygen canister" width={340} height={480} priority />
            </div>
          </div>
          <div className="scroll-indicator">
            <div className="scroll-line" />
            <span className="scroll-text">Scroll</span>
          </div>
        </div>
      </section>

      {/* CRO Strip 1 */}
      <div className="cro-strip">
        <p>Ready to Breathe Better? Order breathEN Today.</p>
        <Link href="/checkout" className="btn-white">Get Your Can →</Link>
      </div>

      {/* ── 2. ABOUT ── */}
      <section id="about" aria-label="About breathEN">
        <div className="about-inner">
          <div className="about-left">
            <span className="section-label">About Us</span>
            <h2 className="about-headline">
              We Built breath<span style={{ color: 'var(--red)' }}>EN</span><br />Because the Air<br /><em>Stopped Being Enough.</em>
            </h2>
            <div className="about-body">
              <p>Polluted air. Relentless stress. Daily exertion. These quiet forces drain our energy, focus, and productivity — and we barely realise it until our bodies begin to struggle.</p>
              <p>This is felt when we are in closed offices for a long time, travelling in packed air-conditioned cars, walking on polluted streets where breathing suffocates.</p>
              <p>So should we escape city life? Abandon our work, our ambitions, our responsibilities? <strong>No.</strong></p>
              <p>Because when breathing naturally becomes difficult, breathEN is here to help you. breathEN is not a replacement for nature — it is a companion, designed to assist the body with comfortable breaths.</p>
              <p>The danger today is invisible — and invisible enemies are the hardest to beat.</p>
              <p>At breathEN, we believe in a simple truth: <strong>You don&apos;t need to be superhuman. You just want to feel well enough to show up.</strong></p>
            </div>
            <p className="about-tagline">&ldquo;Breathe better, live Smarter. #breathEN&rdquo;</p>
          </div>
          <div className="about-right">
            <div className="about-stats">
              <div className="about-stat">
                <span className="about-stat-upto">&nbsp;</span>
                <span className="about-stat-val" data-target="99" data-suffix="%">0%</span>
                <span className="about-stat-lbl">Pure Oxygen</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-upto">Upto</span>
                <span className="about-stat-val" data-target="200" data-suffix="">0</span>
                <span className="about-stat-lbl">Shots per Can</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-upto">&nbsp;</span>
                <span className="about-stat-val" data-target="0" data-suffix="">0</span>
                <span className="about-stat-lbl">Side Effects</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee dark */}
      <div className="marquee-wrap marquee-dark">
        <div className="marquee-track">
          {['BREATHE BETTER','·','LIVE STRONGER','·','URBAN LIFESTYLE','·','FITNESS READY','·','TRAVEL READY','·','ALTITUDE READY','·','NOSE BREATHING','·','LEAK PROOF','·','RECYCLABLE','·',
            'BREATHE BETTER','·','LIVE STRONGER','·','URBAN LIFESTYLE','·','FITNESS READY','·','TRAVEL READY','·','ALTITUDE READY','·','NOSE BREATHING','·','LEAK PROOF','·','RECYCLABLE','·',
          ].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      {/* ── 3. WHY ── */}
      <section id="why" aria-label="Who breathEN helps">
        <div className="why-header">
          <span className="section-label" style={{ opacity: 1, textAlign: 'center', display: 'block' }}>Who breathEN Helps</span>
          <h2 className="why-title">One Product.<br /><em>Five Real Needs.</em></h2>
          <p className="why-sub">Whether you&apos;re ascending a mountain, managing a deadline, or supporting an elderly parent — breathEN delivers 99% pure oxygen when your body needs it most.</p>
        </div>
        <div className="why-grid">
          {[
            { num:'01', img:'lifestyle-trek.webp', icon:'🏔️', title:'High Altitude & Pilgrimage', desc:'Every year thousands travel to Kedarnath, Badrinath, Ladakh, Sikkim. As altitude rises, oxygen drops. Breathlessness, fatigue, headache and dizziness follow.', list:['Pilgrims fulfilling faith','Bikers conquering terrain','Travellers & photographers'] },
            { num:'02', img:'lifestyle-yoga.webp', icon:'👴', title:'Elderly & Vulnerable', desc:'With age, lung capacity to exchange oxygen in the blood decreases. Walking, climbing stairs, travelling — simple activities become exhausting... and suffocating. breathEN provides gentle, immediate comfort.', list:['Improves comfort & confidence','Reduces breathlessness & exhaustion','Immediate on-the-go comfort and relief'] },
            { num:'03', img:'lifestyle-fire.webp', icon:'🚒', title:'First Aid & Emergency', desc:'Emergencies give no warnings. Fire incidents, factory accidents, smoke, chemical and gases exposure, sudden breathlessness — breathEN acts as immediate temporary oxygen boost before help arrives.', list:['Police & fire rescue teams','Factory and industrial staff and personnel','Residential building dwellers'] },
            { num:'04', img:'lifestyle-office.webp', icon:'💼', title:'Indoor Professionals', desc:'Millions spend 8–12 hours indoors daily. AC environments have lower oxygen, higher CO₂ — causing mental fatigue, low productivity, sleepiness and headaches.', list:['Office workers & IT professionals','Designers & students','Anyone working indoors'] },
            { num:'05', img:'lifestyle-gym.webp', icon:'⚡', title:'Fitness & Athletes', desc:'Physical exertion increases oxygen demand. breathEN supports muscle recovery, reduces fatigue, improves alertness and restores energy faster after intense sessions.', list:['Athletes & gym users','Cyclists & runners','Sports professionals'] },
          ].map((c) => (
            <div key={c.num} className="why-card">
              <span className="why-card-num">{c.num}</span>
              <Image src={`/assets/${c.img}`} className="why-card-img" alt={c.title} width={400} height={280} loading="lazy" />
              <div className="why-card-body">
                <span className="why-card-icon">{c.icon}</span>
                <span className="why-card-title">{c.title}</span>
                <p className="why-card-desc">{c.desc}</p>
                <ul className="why-card-list">{c.list.map((l, i) => <li key={i}>{l}</li>)}</ul>
              </div>
              <div className="why-card-line" />
            </div>
          ))}
        </div>

        {/* Photo strip */}
        <div className="who-helps-photo-strip">
          <div className="who-photo-side">
            <Image src="/assets/person-using.jpg" alt="Person using breathEN" width={480} height={600} loading="lazy" />
            <div className="who-photo-caption">breathEN — 99% Pure Recreational Oxygen</div>
          </div>
          <div className="who-role-side">
            <h3>ONE CANISTER.<br />FIVE LIVES.</h3>
            <p className="who-role-tagline">breathEN is not a medical device — it is a companion designed to give your body comfortable breaths when the air around you simply isn&apos;t enough.</p>
            <div className="who-benefits-grid">
              {['Instant oxygen boost','No prescription needed','Zero side effects','Upto 200 shots per can','Trusted by fire officers','Ships across India'].map((b) => (
                <div key={b} className="who-benefit-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" opacity={0.7}><polyline points="20 6 9 17 4 12" /></svg>
                  <span className="who-benefit-text">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. PRODUCT ── */}
      <section id="product" aria-label="Product details">
        <div className="product-header">
          <span className="section-label" style={{ opacity: 1, textAlign: 'center', display: 'block' }}>The Product</span>
          <h2 className="product-title">Everything You Need.<br /><em>Nothing You Don&apos;t.</em></h2>
        </div>

        {/* Benefits slideshow */}
        <div className="benefits-slideshow">
          <div className="slideshow-track" id="slideshow-track">
            <div className="slide active">
              <Image src="/assets/benefits-1.jpg" alt="Lifestyle benefits — breathEN" width={900} height={500} loading="lazy" />
              <div className="slide-label">Lifestyle Benefits</div>
            </div>
            <div className="slide">
              <Image src="/assets/benefits-2.jpg" alt="Performance benefits — breathEN" width={900} height={500} loading="lazy" />
              <div className="slide-label">Performance Benefits</div>
            </div>
          </div>
          <div className="slideshow-controls">
            <button className="slide-btn slide-prev" aria-label="Previous slide">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <div className="slide-dots">
              <button className="slide-dot active" data-index="0" aria-label="Slide 1" />
              <button className="slide-dot" data-index="1" aria-label="Slide 2" />
            </div>
            <button className="slide-btn slide-next" aria-label="Next slide">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        {/* How to use */}
        <div className="howto-section">
          <div className="howto-header">
            <span className="section-label" style={{ opacity: 1 }}>Instructions for Use</span>
            <h3 className="howto-title">Simple as<br /><em>Taking a Breath.</em></h3>
          </div>
          <div className="howto-grid">
            <div className="howto-steps">
              {[
                { n:1, h:'Place the Mask', p:'Place the mask over your nose and mouth for a comfortable, secure fit.' },
                { n:2, h:'Activate the Shot', p:'Press and quick release the actuator (button) to activate each shot.' },
                { n:3, h:'Inhale Deeply', p:'Inhale the shot deeply through your nose — the natural breathing pathway.' },
                { n:4, h:'Repeat as Needed', p:'Inhale 5–10 shots as needed. For exertion, shots can be increased as required.' },
                { n:5, h:'Feel the Difference', p:'Experience immediate freshness, better focus, and reduced fatigue within seconds.' },
              ].map((s) => (
                <div key={s.n} className="howto-step">
                  <div className="step-num">{s.n}</div>
                  <div className="step-content"><h4>{s.h}</h4><p>{s.p}</p></div>
                </div>
              ))}
            </div>
            <div className="howto-visual">
              <Image src="/assets/person-using.jpg" alt="breathEN in use" width={500} height={600} loading="lazy" style={{ objectFit:'cover', objectPosition:'center 20%' }} />
              <div className="howto-visual-overlay" />
            </div>
          </div>
        </div>

        {/* Callouts */}
        <div className="product-callouts">
          <div className="callout-card callout-card--full">
            <Image src="/assets/product-detail.jpg" className="callout-img callout-img--tall" alt="breathEN nose breathing technology" width={600} height={700} loading="lazy" />
            <div className="callout-text">
              <div className="callout-point">
                <span className="section-label" style={{ opacity: 1 }}>Unique Design</span>
                <h4 className="callout-title"><em>Nose Breathing</em><br />Technology</h4>
                <p className="callout-desc">Follows the body&apos;s natural breathing pathway. The specially designed mask delivers oxygen directly through nasal inhalation — the way nature intended.</p>
              </div>
              <div className="callout-divider" />
              <div className="callout-point">
                <span className="section-label" style={{ opacity: 1 }}>Engineering</span>
                <h4 className="callout-title">Leak-Proof<br /><em>Aluminium Can</em></h4>
                <p className="callout-desc">Sealed aluminium construction prevents oxygen leakage. Lightweight, recyclable, and built for on-the-go use. Each can holds 8.5L of 99% pure oxygen.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CRO Strip 2 */}
      <div className="cro-strip">
        <p>Upto 200 Shots. Zero Side Effects. One Deep Breath Away.</p>
        <Link href="/checkout" className="btn-white">Order breathEN →</Link>
      </div>

      {/* Quote marquee */}
      <div className="marquee-wrap" style={{ background:'#f5f5f5', borderTop:'1px solid rgba(0,0,0,.07)', borderBottom:'1px solid rgba(0,0,0,.07)' }}>
        <div className="marquee-track" style={{ animationDuration:'26s', color:'rgba(26,26,26,.5)' }}>
          {['IMDAD FAKHI','·','"Works like magic, totally indispensable"','·','SS PATIL — FIRE OFFICER','·','"Get your breath back almost immediately"','·','RABIYA BI, 68','·','"Gives me comfort and support"','·',
            'IMDAD FAKHI','·','"Works like magic, totally indispensable"','·','SS PATIL — FIRE OFFICER','·','"Get your breath back almost immediately"','·',
          ].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      {/* ── 5. TESTIMONIALS ── */}
      <section id="testimonials" aria-label="Customer testimonials">
        <div className="testimonials-header">
          <span className="section-label" style={{ opacity:1, textAlign:'center', display:'block' }}>Real People. Real Breath.</span>
          <h2 className="testimonials-title">What They Say About <em>breathEN</em></h2>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card" style={{ gridColumn:'1/-1', background:'#fff8f7', border:'1px solid rgba(232,38,10,.08)' }}>
            <span className="quote-mark">&ldquo;</span>
            <p className="testimonial-text">Get your breath back almost immediately with breathEN.</p>
            <div className="testimonial-author">
              <span className="author-name">SS Patil</span>
              <span className="author-title">Fire Officer</span>
              <div className="fire-badge">🚒 Verified First Responder</div>
            </div>
          </div>
          <div className="testimonial-card">
            <span className="quote-mark">&ldquo;</span>
            <p className="testimonial-text">BreathEN reduces fatigue, gives a quick performance boost, and provides relief from smog and pollution. It&apos;s an awesome product and works like magic, totally indispensable.</p>
            <div className="testimonial-author">
              <span className="author-name">Imdad Fakhi</span>
              <span className="author-title">breathEN User</span>
            </div>
          </div>
          <div className="testimonial-card">
            <span className="quote-mark">&ldquo;</span>
            <p className="testimonial-text">For years, stepping outside felt frightening. My breathing would get heavy, and I avoided walking altogether. When my breathing starts to feel difficult, breathEN gives me comfort and support. It helps me calm down, breathe easier, and regain confidence to continue.</p>
            <div className="testimonial-author">
              <span className="author-name">Rabiya Bi, 68 years</span>
              <span className="author-title">Has Chronic Asthma</span>
            </div>
          </div>
          <div className="testimonial-card" style={{ gridColumn:'1/-1', background:'rgba(232,38,10,.04)', border:'1px solid rgba(232,38,10,.12)' }}>
            <span className="quote-mark">&ldquo;</span>
            <p className="testimonial-text">Hospital visit avoided — just because breathEN supported their breathing immediately after evacuating the building. They were able to breathe normally again with only 10–12 shots.</p>
            <div className="testimonial-author">
              <span className="author-name">Anonymous Housewife</span>
              <span className="author-title">Fire Incident Evacuee</span>
              <div className="fire-badge">🏥 Hospital Visit Avoided</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ ── */}
      <FAQ />

      {/* ── 7. CTA ── */}
      <section id="cta">
        <div className="cta-bg" />
        <div className="cta-inner">
          <span className="cta-eyebrow">The next breath changes everything</span>
          <h2 className="cta-headline">Breathe <span>Better.</span></h2>
          <h3 className="cta-sub">Live Stronger.</h3>
          <div className="btn-magnetic-wrap">
            <Link href="/checkout" className="cta-btn">Get breathEN Now</Link>
          </div>
        </div>
      </section>

      {/* ── 8. CONTACT ── */}
      <section id="contact">
        <div className="contact-inner">
          <div className="contact-brand">
            <Image src="/assets/logo-white.jpg" className="contact-logo-img" alt="breathEN logo" width={160} height={48} />
            <p>The world&apos;s first nose breathing oxygen canister. 99% pure recreational oxygen for urban living, fitness, travel, and beyond.</p>
            <div className="contact-social">
              <a href="https://www.instagram.com/breathen_99" target="_blank" rel="noopener" className="social-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
                Instagram
              </a>
              <a href="https://www.youtube.com/@breathENOXYGEN" target="_blank" rel="noopener" className="social-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor"/></svg>
                YouTube
              </a>
              <a href="https://twitter.com/Breathen_99" target="_blank" rel="noopener" className="social-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" stroke="none"/></svg>
                X / Twitter
              </a>
            </div>
          </div>
          <div className="contact-col">
            <h4>Contact Us</h4>
            <a href={EMAIL_ENQUIRY}>info@breathen99.com</a>
            <a href="tel:+919819250202">+91 98192 50202</a>
            <p style={{ marginTop:16 }}>Office no.01, 1st floor, B wing<br />Gami Industrial Park, Plot No. C-39A<br />Pawane MIDC, Navi Mumbai — 400705</p>
          </div>
          <div className="contact-col">
            <h4>Quick Links</h4>
            <a href="#about">About breathEN</a>
            <a href="#why">Why breathEN</a>
            <a href="#product">Product Details</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#faq">FAQ</a>
            <a href="https://www.youtube.com/shorts/T9LWqEXDPhE" target="_blank" rel="noopener">How to Use (Video)</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-links">
          <a href="#faq">FAQ</a>
          <a href={EMAIL_ENQUIRY}>Contact</a>
          <a href="https://www.instagram.com/breathen_99" target="_blank" rel="noopener">Instagram</a>
        </div>
        <span className="footer-copy">© 2026 breathEN · Recreational Oxygen · Navi Mumbai, India</span>
      </footer>

      {/* Sticky mobile buy bar */}
      <div className="sticky-buy-bar">
        <div className="sticky-text">
          <strong>breathEN Oxygen</strong>
          <span className="sticky-mrp">₹900</span> <span className="sticky-sale-price">₹495</span>
        </div>
        <Link href="/checkout" className="sticky-buy-btn">Buy Now — ₹495</Link>
      </div>

      {/* Floating buttons */}
      <div className="float-cta">
        <a href="tel:+919819250202" className="float-btn phone" title="Call us" aria-label="Call breathEN">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11.5a19.79 19.79 0 0 1-3-8.59A2 2 0 0 1 3.15 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </a>
        <a href={EMAIL_ENQUIRY} className="float-btn email" title="Email us" aria-label="Email breathEN">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </a>
        <a href={WHATSAPP_ENQUIRY} target="_blank" rel="noopener" className="float-btn whatsapp" title="WhatsApp us" aria-label="WhatsApp breathEN">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        </a>
      </div>

      <HeroAnimations />
    </>
  );
}
