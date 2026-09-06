'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Same manual grouping as the checkout page: identical output on every device.
function inr(n: number): string {
  if (!Number.isFinite(n)) return '0';
  const s = Math.round(Math.abs(n)).toString();
  if (s.length <= 3) return s;
  const tail = s.slice(-3);
  let head = s.slice(0, -3);
  const groups: string[] = [];
  while (head.length > 2) {
    groups.unshift(head.slice(-2));
    head = head.slice(0, -2);
  }
  if (head) groups.unshift(head);
  return `${groups.join(',')},${tail}`;
}

export default function ThankyouPage() {
  const [data, setData] = useState({ name:'', qty:'', amount:'', paymentId:'' });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setData({
      name: p.get('name') || '',
      qty: p.get('qty') || '1',
      amount: p.get('amount') || '',
      paymentId: p.get('paymentId') || '',
    });
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--red:#e8260a;--black:#0a0a0a;--white:#ffffff;--gray-200:#e8e8e8;--gray-400:#999;--gray-600:#555;--font-sans:'DM Sans',sans-serif;--font-serif:'Playfair Display',serif}
        html,body{font-family:var(--font-sans);background:#fafafa;color:var(--black);min-height:100vh}
        .topbar{background:#fff;border-bottom:1px solid var(--gray-200);padding:14px 24px;display:flex;align-items:center;justify-content:center}
        .page{max-width:560px;margin:0 auto;padding:60px 20px 80px;text-align:center}
        .check-circle{width:72px;height:72px;background:var(--red);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 28px}
        .ty-headline{font-family:var(--font-serif);font-size:2rem;font-weight:700;margin-bottom:10px;line-height:1.2}
        .ty-sub{color:var(--gray-600);line-height:1.6;margin-bottom:32px}
        .ty-card{background:#fff;border:1px solid var(--gray-200);border-radius:4px;padding:24px;margin-bottom:28px;text-align:left}
        .ty-card h4{font-weight:600;font-size:.9rem;margin-bottom:14px;text-transform:uppercase;letter-spacing:.06em;font-size:.78rem}
        .ty-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f4f4f4;font-size:.88rem}
        .ty-row:last-child{border:none}
        .ty-row .label{color:var(--gray-400)}
        .ty-pid{font-size:.72rem;color:var(--gray-400);word-break:break-all;margin-top:12px}
        .btn-home{display:inline-block;background:var(--red);color:#fff;text-decoration:none;padding:14px 36px;border-radius:3px;font-size:.88rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;margin-top:8px;transition:background .2s}
        .btn-home:hover{background:#b81d07}
        .whatsapp-note{margin-top:20px;font-size:.82rem;color:var(--gray-600)}
        .whatsapp-note a{color:var(--red);text-decoration:none}
      ` }} />

      <div className="topbar">
        <Image src="/assets/logo-white.jpg" alt="breathEN" width={120} height={36} style={{ objectFit:'contain' }} />
      </div>

      <div className="page">
        <div className="check-circle">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 className="ty-headline">Order Confirmed!</h1>
        <p className="ty-sub">
          {(data.name ? `Thank you, ${data.name.split(' ')[0]}! ` : 'Thank you! ') +
            `Your breathEN oxygen ${parseInt(data.qty) > 1 ? 'canisters are' : 'canister is'} on the way. ` +
            "You'll receive a confirmation shortly."}
        </p>

        {data.amount && (
          <div className="ty-card">
            <h4>Order Details</h4>
            {data.name && <div className="ty-row"><span className="label">Name</span><span>{data.name}</span></div>}
            <div className="ty-row"><span className="label">Quantity</span><span>{`${data.qty} can${parseInt(data.qty)>1?'s':''}`}</span></div>
            <div className="ty-row"><span className="label">Amount Paid</span><span>{`₹${inr(parseInt(data.amount, 10))}`}</span></div>
            <div className="ty-row"><span className="label">Shipping</span><span style={{ color:'#1a8a3a' }}>FREE</span></div>
            {data.paymentId && <div className="ty-pid">{`Payment ID: ${data.paymentId}`}</div>}
          </div>
        )}

        <Link href="/" className="btn-home">Back to breathEN</Link>

        <p className="whatsapp-note">
          <span>Questions? WhatsApp us at </span>
          <a href="https://wa.me/919819250202" target="_blank" rel="noopener">+91 98192 50202</a>
        </p>
      </div>
    </>
  );
}
