'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLLMConfig } from '@/context/LLMConfigContext';
import styles from './ModelStatusBanner.module.css';

const PROVIDER_LABELS = {
  ollama: 'Ollama',
  vllm:   'vLLM',
  anthropic: 'Anthropic',
};

const POLL_INTERVAL_MS = 15_000;

export default function ModelStatusBanner() {
  const {
    selectedModel,
    selectModel,
    availableModels,
    provider,           // configured provider (was: provider)
    isLoading,
  } = useLLMConfig();

  const pathname = usePathname();
  const router   = useRouter();

  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState({
    state: 'checking',           // 'checking' | 'online' | 'offline'
    activeProvider: null,        // who's currently serving
    isFailedOver: false,
    fallbackModel: null,
  });
  const modalRef = React.useRef(null);

  const isInLesson    = pathname?.startsWith('/lessons/') && pathname !== '/lessons';
  const isLessonGrid  = pathname === '/lessons';
  // Don't allow model switching while on the fallback — Claude doesn't use the local model list
  const canSwitch     = isLessonGrid && provider === 'ollama' && !status.isFailedOver;

  // Poll provider status
  React.useEffect(() => {
    if (!provider) return;
    let cancelled = false;

    async function checkStatus() {
      try {
        const res = await fetch('/api/llm/status');
        if (cancelled) return;
        if (!res.ok) {
          setStatus(s => ({ ...s, state: 'offline' }));
          return;
        }
        const data = await res.json();
        setStatus({
          state: data.primary_online || data.is_failed_over ? 'online' : 'offline',
          activeProvider: data.active_provider,
          isFailedOver: data.is_failed_over,
          fallbackModel: data.fallback_model,
        });
      } catch {
        if (!cancelled) setStatus(s => ({ ...s, state: 'offline' }));
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

  // What the pill/modal should display: when failed over, show fallback info
  const displayModel    = status.isFailedOver ? status.fallbackModel : selectedModel;
  const displayProvider = status.isFailedOver ? 'anthropic' : provider;
  const statusOnline    = status.state === 'online';

  return (
    <>
      {/* ── Pill trigger ── */}
      <button className={styles.pill} onClick={() => setOpen(true)}>
        <span className={`${styles.pillBadge} ${statusOnline ? styles.online : status.state === 'offline' ? styles.offline : styles.checking}`}>
          <span className={`${styles.pillDot} ${statusOnline ? styles.online : status.state === 'offline' ? styles.offline : styles.checking}`} />
          {status.state === 'checking'
            ? 'Connecting'
            : status.isFailedOver
              ? 'Backup'
              : statusOnline ? 'Online' : 'Offline'}
        </span>
        <span className={styles.pillModel}>{displayModel}</span>
        <span className={styles.pillSlash}>/</span>
        <span className={styles.pillProvider}>{PROVIDER_LABELS[displayProvider] ?? displayProvider}</span>
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
                {status.isFailedOver ? (
                  <>
                    The primary tutor model is currently offline. Your tutor is temporarily
                    powered by <strong>{status.fallbackModel}</strong> via{' '}
                    <strong>Anthropic</strong> as a backup. New conversations will switch
                    back to the primary model once it is online again.
                  </>
                ) : (
                  <>
                    Your tutor is powered by <strong>{selectedModel}</strong>, served
                    via <strong>{PROVIDER_LABELS[provider] ?? provider}</strong> — an open-source
                    inference library running on secure university servers.
                  </>
                )}
              </p>

              {/* Status row */}
              <div className={styles.statusRow}>
                <div className={styles.statusRowLeft}>
                  <span className={styles.statusModel}>{displayModel}</span>
                  <span className={styles.statusMeta}>{PROVIDER_LABELS[displayProvider] ?? displayProvider}</span>
                </div>
                <span className={`${styles.statusBadge} ${styles[status.state]}`}>
                  <span className={`${styles.statusDot} ${styles[status.state]}`} />
                  {status.state === 'checking'
                    ? 'Connecting…'
                    : status.isFailedOver
                      ? 'Backup active'
                      : statusOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Offline notice (only when *neither* primary nor fallback is serving) */}
              {status.state === 'offline' && !status.isFailedOver && (
                <div className={styles.offlineNotice}>
                  The model is currently unreachable. Please check back later or{' '}
                  contact us if the issue persists!
                </div>
              )}

              {/* Model switcher — only on lessons grid, only on Ollama, only when primary is serving */}
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