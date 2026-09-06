'use client';

// ---------------------------------------------------------------------------
// TEMPORARY DEBUG PANEL — remove once the on-device crash is identified.
// Renders the real error message, stack and digest on screen so a failure that
// only happens on a customer's phone can be read (or screenshotted) directly.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react';

// Bump this on every debug build. Round 1 was inconclusive partly because we
// could not tell which build a report came from.
export const BUILD_TAG = 'debug-2';

type EarlyError = { kind: string; msg: string; src?: string; line?: number; col?: number; stack?: string };

declare global {
  interface Window { __earlyErrors?: EarlyError[] }
}

export default function ErrorDiagnostics({
  boundary,
  error,
}: {
  boundary: string;
  error: Error & { digest?: string };
}) {
  // The error itself is built synchronously, so it is on screen even if the
  // effect below never runs. Round 1 produced no data at all; this removes one
  // way that could happen.
  const errorLines = () => [
    `boundary : ${boundary}`,
    `build    : ${BUILD_TAG}`,
    `time     : ${new Date().toISOString()}`,
    `url      : ${typeof location !== 'undefined' ? location.href : '?'}`,
    `name     : ${error?.name || '(none)'}`,
    `digest   : ${error?.digest || '(none)'}`,
    `message  : ${error?.message || String(error)}`,
    '',
    'stack:',
    error?.stack || '(no stack)',
  ];

  const [report, setReport] = useState(() => errorLines().join('\n'));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const early = (typeof window !== 'undefined' && window.__earlyErrors) || [];
    const lines = [
      ...errorLines(),
      '',
      `early errors captured before the boundary: ${early.length}`,
      ...early.map((e, i) =>
        `  [${i}] ${e.kind}: ${e.msg}` +
        (e.src ? `\n       at ${e.src}:${e.line}:${e.col}` : '') +
        (e.stack ? `\n       ${e.stack.split('\n').slice(0, 4).join('\n       ')}` : '')
      ),
      '',
      'device:',
      `  ua       : ${typeof navigator !== 'undefined' ? navigator.userAgent : '?'}`,
      `  lang     : ${typeof navigator !== 'undefined' ? navigator.language : '?'}`,
      `  screen   : ${typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '?'} dpr=${typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : '?'}`,
      `  viewport : ${typeof innerWidth !== 'undefined' ? `${innerWidth}x${innerHeight}` : '?'}`,
      `  intl     : ${typeof Intl !== 'undefined' ? 'yes' : 'NO'} / tz=${(() => {
        try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '(none)'; } catch (e) { return `THREW ${String(e)}`; }
      })()}`,
      `  en-IN fmt: ${(() => { try { return (100000).toLocaleString('en-IN'); } catch (e) { return `THREW ${String(e)}`; } })()}`,
      `  razorpay : ${typeof window !== 'undefined' && 'Razorpay' in window ? 'loaded' : 'not loaded'}`,
    ];
    setReport(lines.join('\n'));
  }, [boundary, error]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
    } catch {
      const el = document.getElementById('diag-text');
      if (el) {
        const r = document.createRange();
        r.selectNodeContents(el);
        const sel = getSelection();
        sel?.removeAllRanges();
        sel?.addRange(r);
      }
    }
  };

  return (
    <div style={{ marginTop: 32, textAlign: 'left', border: '1px solid #e8e8e8', borderRadius: 4, background: '#fafafa' }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #e8e8e8', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <strong style={{ fontSize: '.75rem', letterSpacing: '.06em', textTransform: 'uppercase', color: '#555' }}>
          Diagnostic details
        </strong>
        <button
          onClick={copy}
          style={{ fontSize: '.72rem', padding: '6px 10px', border: '1px solid #ccc', borderRadius: 3,
                   background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {copied ? 'Copied' : 'Copy / select'}
        </button>
      </div>
      <pre
        id="diag-text"
        style={{ margin: 0, padding: 12, fontSize: 10.5, lineHeight: 1.45, whiteSpace: 'pre-wrap',
                 wordBreak: 'break-word', overflowWrap: 'anywhere', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                 color: '#222', maxHeight: '55vh', overflow: 'auto', WebkitUserSelect: 'text', userSelect: 'text' }}
      >
        {report || 'collecting…'}
      </pre>
      <div style={{ padding: '8px 12px', borderTop: '1px solid #e8e8e8', fontSize: '.7rem', color: '#999' }}>
        Temporary debug output — please screenshot or copy this and send it over.
      </div>
    </div>
  );
}
