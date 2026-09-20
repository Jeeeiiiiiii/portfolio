"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { LINK_HOST_ALLOWLIST } from '@/lib/visitors/allowlist';
import type { PrStatus } from '@/lib/visitors/github';
import { stepStates } from '@/lib/visitors/pipeline';
import PipelineView from './pipeline-view';

/**
 * "Add your card": a modal form with a Turnstile challenge that POSTs to
 * /api/visitors/submit, then a live tracker that polls /api/visitors/status
 * and lights up the pipeline as the PR moves.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void; 'expired-callback'?: () => void; 'error-callback'?: () => void; theme?: 'light' | 'dark' | 'auto' }) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const POLL_MS = 8000;

const inputClass =
  'w-full bg-background border border-gray-200 rounded-md px-3 py-2.5 font-mono text-[13px] text-ink placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors duration-200';

function useTurnstile(siteKey: string, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !ref.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: 'auto',
        callback: (t) => setToken(t),
        'expired-callback': () => setToken(null),
        'error-callback': () => setToken(null),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SRC}"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = TURNSTILE_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', render);
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
      setToken(null); // tokens are single-use and short-lived; never reuse one across opens
    };
  }, [siteKey, enabled]);

  const reset = useCallback(() => {
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    setToken(null);
  }, []);

  return { ref, token, reset };
}

function Tracker({ prNumber, prUrl }: { prNumber: number; prUrl: string }) {
  const [status, setStatus] = useState<PrStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    let stopped = false;

    const tick = async () => {
      try {
        const res = await fetch(`/api/visitors/status?pr=${prNumber}`, { cache: 'no-store' });
        if (res.ok) {
          const next = (await res.json()) as PrStatus;
          setStatus(next);
          setError(null);
          if (next.state !== 'open') return; // terminal: stop polling
        } else if (res.status !== 502 && res.status !== 429) {
          setError('status unavailable');
          return;
        }
      } catch {
        setError('status unavailable');
      }
      if (!stopped) timer = window.setTimeout(tick, POLL_MS);
    };

    tick();
    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [prNumber]);

  const states = stepStates(status);
  const link = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="micro !text-[9px] hover:text-ink transition-colors duration-200">
      {label} ↗
    </a>
  );

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
        <p className="text-[13px] text-ink">
          Pull request <span className="font-mono">#{prNumber}</span> is open.
        </p>
        <span className="micro">
          {error ?? (status?.state === 'open' ? 'refreshing every 8s' : status?.state ?? 'checking')}
        </span>
      </div>
      <PipelineView
        states={states}
        extras={{
          pr: link(prUrl, 'open on github'),
          preview: status?.previewUrl ? link(status.previewUrl, 'open preview') : undefined,
          live: status?.state === 'merged' ? link('/visitors', 'reload the wall') : undefined,
        }}
      />
      {status?.state === 'closed' && (
        <p className="text-[12px] text-gray-500 mt-5">Closed without merging. That happens — resubmit any time.</p>
      )}
    </div>
  );
}

export default function SubmitForm({ siteKey }: { siteKey: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ prNumber: number; prUrl: string } | null>(null);
  const [message, setMessage] = useState('');
  const { ref: turnstileRef, token, reset } = useTurnstile(siteKey, open && !result);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      setError('Complete the captcha first.');
      return;
    }
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const link = String(form.get('link') ?? '').trim();
    const payload = {
      name: String(form.get('name') ?? ''),
      role: String(form.get('role') ?? ''),
      message: String(form.get('message') ?? ''),
      link: link ? link : null,
      turnstileToken: token,
    };
    try {
      const res = await fetch('/api/visitors/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { prNumber?: number; prUrl?: string; detail?: string; error?: string };
      if (res.ok && json.prNumber && json.prUrl) {
        setResult({ prNumber: json.prNumber, prUrl: json.prUrl });
      } else {
        setError(json.detail ?? json.error ?? 'Something went wrong.');
        reset();
      }
    } catch {
      setError('Network error. Try again.');
      reset();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-ink text-background text-xs px-4 py-2 rounded-md hover:opacity-90 transition-opacity duration-200"
      >
        add your card
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="visitor-form-title">
          <button aria-label="close" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-background border border-gray-200 rounded-t-2xl sm:rounded-2xl p-6 shadow-[var(--shadow-modal)]">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 id="visitor-form-title" className="text-[15px] font-semibold tracking-tight">
                  {result ? 'your card is on its way' : 'add your card'}
                </h2>
                <p className="micro mt-1">{result ? 'watch it move through the pipeline' : 'this opens a real pull request'}</p>
              </div>
              <button aria-label="close" onClick={() => setOpen(false)} className="p-1 text-gray-500 hover:text-ink transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {result ? (
              <Tracker prNumber={result.prNumber} prUrl={result.prUrl} />
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="v-name" className="micro block mb-2">name</label>
                    <input id="v-name" name="name" className={inputClass} minLength={2} maxLength={40} required autoComplete="name" />
                  </div>
                  <div>
                    <label htmlFor="v-role" className="micro block mb-2">role</label>
                    <input id="v-role" name="role" className={inputClass} minLength={2} maxLength={60} required placeholder="SRE @ somewhere" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <label htmlFor="v-message" className="micro">message</label>
                    <span className="micro !text-[9px]">{message.length}/200</span>
                  </div>
                  <textarea
                    id="v-message"
                    name="message"
                    rows={3}
                    className={inputClass}
                    minLength={10}
                    maxLength={200}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What brought you here?"
                  />
                </div>
                <div>
                  <label htmlFor="v-link" className="micro block mb-2">link — optional, {LINK_HOST_ALLOWLIST.join(' or ')}</label>
                  <input id="v-link" name="link" type="url" className={inputClass} placeholder="https://github.com/you" />
                </div>

                <div ref={turnstileRef} className="min-h-[65px]" />

                {error && <p className="text-[12px] text-ink border border-gray-300 rounded-md px-3 py-2">{error}</p>}

                <div className="flex items-center justify-between gap-4 pt-1">
                  <p className="micro !text-[9px] max-w-[60%]">
                    no account needed · your card becomes a commit under a bot identity · stale prs close in 7 days
                  </p>
                  <button
                    type="submit"
                    disabled={busy || !token}
                    className="bg-ink text-background text-xs px-4 py-2 rounded-md hover:opacity-90 transition-opacity duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {busy ? 'opening pr…' : 'open pull request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
