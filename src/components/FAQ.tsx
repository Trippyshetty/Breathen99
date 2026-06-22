'use client';
import { useState } from 'react';

const faqs = [
  { q: 'What is breathEN?', a: 'breathEN is the world\'s first nose breathing canister containing 99% pure oxygen, designed to help you feel refreshed, re-energised, and mentally clear in moments when pollution, fatigue, stress, or physical exertion drain your body. It is a wellness and lifestyle product — not a medical device.' },
  { q: 'How do I use breathEN?', a: 'Place the mask over your nose and mouth. Press and quick release the actuator to activate each shot. Inhale deeply. Repeat 5–10 shots as needed. For full video instructions, visit our YouTube channel: breathEN OXYGEN.' },
  { q: 'How long does one canister last?', a: 'Each canister contains 8.5 litres of 99% pure oxygen, equating to over 200 shots. A full can feels empty because oxygen gas has virtually no discernible mass — but it is guaranteed full.' },
  { q: 'Are there any side effects?', a: 'No. breathEN has zero side effects because it is simply much higher quality air than you normally breathe. No known side effects when used as directed. Overuse is not recommended.' },
  { q: 'Can I use breathEN with COPD or asthma?', a: 'breathEN is a supplemental oxygen product that helps you breathe more comfortably during shortness of breath or exertion. It is not a replacement for prescribed medical oxygen. Many COPD individuals find it helpful as an on-the-go boost. Always consult your doctor for medical conditions.' },
  { q: 'Why would I need oxygen when I already breathe air?', a: 'Urban air — especially in cities — often contains high CO₂ levels, pollutants, and low effective oxygen availability. High CO₂ leads to faster exhaustion, brain fog, reduced concentration, and poor recovery. breathEN provides clean, concentrated oxygen that helps your body recover faster when natural breathing isn\'t enough.' },
  { q: 'Is breathEN a medical product?', a: 'No. breathEN is not a medical device and does not replace medical oxygen or treatment. It is a wellness and lifestyle product, meant for general revitalisation and recovery.' },
  { q: 'Can athletes and gym-goers use breathEN?', a: 'Absolutely. breathEN is especially useful for post-workout recovery, intense training sessions, endurance and breathing comfort, and between sets or matches.' },
  { q: 'Is breathEN flammable?', a: 'Oxygen is not a fuel itself, but can accelerate combustion. Store in a cool, dry place, away from direct heat or flames. Keep out of reach of children.' },
  { q: 'Can I recycle the canisters?', a: 'Yes! Our canisters are made from aluminium, which is fully recyclable.' },
  { q: 'Can I collaborate or partner with breathEN?', a: 'Yes! We collaborate with athletes & fitness professionals, corporate wellness programs, gyms & sports academies, and lifestyle & wellness brands. Contact us at info@breathen99.com or call +91 9819250202.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" aria-label="Frequently asked questions">
      <div className="faq-inner">
        <div className="faq-header">
          <span className="section-label">Got Questions?</span>
          <h2 className="faq-title">Everything You Need to <em>Know</em></h2>
        </div>
        {faqs.map((f, i) => (
          <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
            <div className="faq-question" onClick={() => setOpen(open === i ? null : i)} style={{ cursor: 'pointer' }}>
              <span className="faq-q-text">{f.q}</span>
              <div className="faq-toggle">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {open === i
                    ? <path d="M5 12h14" />
                    : <path d="M12 5v14M5 12h14" />}
                </svg>
              </div>
            </div>
            <div className="faq-answer" style={{ display: open === i ? 'block' : 'none' }}>
              <div className="faq-answer-inner">{f.a}</div>
            </div>
          </div>
        ))}
        <div className="faq-cta">
          <p>Still have questions? We&apos;d love to help.</p>
          <a href="/checkout" className="btn-primary">Buy Now</a>
        </div>
      </div>
    </section>
  );
}
