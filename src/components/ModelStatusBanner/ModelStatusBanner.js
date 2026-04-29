'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLLMConfig } from '@/context/LLMConfigContext';
import styles from './ModelStatusBanner.module.css';

const PROVIDER_LABELS = {
  ollama: 'Ollama',
  vllm:   'vLLM',
};

const POLL_INTERVAL_MS = 15_000;

export default function ModelStatusBanner() {
  const { selectedModel, selectModel, availableModels, provider, isLoading } = useLLMConfig();
  const pathname = usePathname();
  const router   = useRouter();

  const [open, setOpen]                   = React.useState(false);
  const [providerStatus, setProviderStatus] = React.useState('checking');
  const modalRef = React.useRef(null);

  const isInLesson    = pathname?.startsWith('/lessons/') && pathname !== '/lessons';
  const isLessonGrid  = pathname === '/lessons';
  const canSwitch     = isLessonGrid && provider === 'ollama';

  // Poll provider health
  React.useEffect(() => {
    if (!provider) return;
    let cancelled = false;

    async function checkStatus() {
      try {
        const res = await fetch('/api/llm/status');
        if (!cancelled)
          setProviderStatus(res.ok && (await res.json()).online ? 'online' : 'offline');
      } catch {
        if (!cancelled) setProviderStatus('offline');
      }
    }

    function handleVisibility() {
      if (!document.hidden) checkStatus();
    }

    checkStatus();
    const id = setInterval(() => { if (!document.hidden) checkStatus(); }, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [provider]);

  // Close modal on outside click
  React.useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close modal on Escape
  React.useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  if (isLoading || !selectedModel || !provider) return null;

  function handleCta() {
    if (isInLesson) {
      setOpen(false);
    } else {
      router.push('/lessons');
      setOpen(false);
    }
  }

  const statusOnline = providerStatus === 'online';

  return (
    <>
      {/* ── Pill trigger ── */}
      <button className={styles.pill} onClick={() => setOpen(true)}>
        <span className={`${styles.pillBadge} ${statusOnline ? styles.online : providerStatus === 'offline' ? styles.offline : styles.checking}`}>
          <span className={`${styles.pillDot} ${statusOnline ? styles.online : providerStatus === 'offline' ? styles.offline : styles.checking}`} />
          {providerStatus === 'checking' ? 'Connecting' : statusOnline ? 'Online' : 'Offline'}
        </span>
        <span className={styles.pillModel}>{selectedModel}</span>
        <span className={styles.pillSlash}>/</span>
        <span className={styles.pillProvider}>{PROVIDER_LABELS[provider] ?? provider}</span>
      </button>

      {/* ── Modal overlay ── */}
      {open && (
        <div className={styles.overlay}>
          <div className={styles.modal} ref={modalRef} role="dialog" aria-modal="true" aria-label="AI tutor status">

            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Your AI tutor</span>
              <button className={styles.modalClose} onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>

            <div className={styles.modalBody}>
              {/* Description */}
              <p className={styles.desc}>
                Your tutor is powered by <strong>{selectedModel}</strong>, served
                via <strong>{PROVIDER_LABELS[provider] ?? provider}</strong> — an open-source
                inference library running on secure university servers.
              </p>

              {/* Status row */}
              <div className={styles.statusRow}>
                <div className={styles.statusRowLeft}>
                  <span className={styles.statusModel}>{selectedModel}</span>
                  <span className={styles.statusMeta}>{PROVIDER_LABELS[provider] ?? provider}</span>
                </div>
                <span className={`${styles.statusBadge} ${styles[providerStatus]}`}>
                  <span className={`${styles.statusDot} ${styles[providerStatus]}`} />
                  {providerStatus === 'checking' ? 'Connecting…' : statusOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Offline notice */}
              {providerStatus === 'offline' && (
                <div className={styles.offlineNotice}>
                  The model is currently unreachable. Please check back later or{' '}
                  contact us if the issue persists!
                {/* uncomment the line below to add a contact link */}
                {/*<a className={styles.contactLink} href="/contact">contact us</a> if the issue persists.*/}
                </div>
              )}

              {/* Model switcher — Ollama on lessons grid only */}
              {canSwitch && statusOnline && (
                <>
                  <div className={styles.divider} />
                  <div>
                    <div className={styles.switcherLabel}>Switch model</div>
                    <div className={styles.switcherList}>
                      {availableModels.map((model) => (
                        <button
                          key={model}
                          className={`${styles.switcherOption} ${model === selectedModel ? styles.active : ''}`}
                          onClick={() => { selectModel(model); setOpen(false); }}
                        >
                          <span className={styles.switcherName}>{model}</span>
                          {model === selectedModel && <span className={styles.switcherCheck}>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* CTA */}
              {statusOnline && (
                <button className={styles.cta} onClick={handleCta}>
                  {isInLesson ? 'Back to chat' : 'Go to lessons'}
                  <span className={styles.ctaArrow}>→</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}