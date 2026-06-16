'use client';

import React from 'react';
import useSWR from 'swr';
import { usePathname, useRouter } from 'next/navigation';
import { useLLMConfig } from '@/context/LLMConfigContext';
import styles from './ModelStatusBanner.module.css';

const PROVIDER_LABELS = {
  ollama: 'Ollama',
  vllm: 'vLLM',
  anthropic: 'Claude',
};

const LLM_STATUS_ENDPOINT = '/api/llm/status';
const POLL_INTERVAL_MS = 15_000;

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error(`status ${res.status}`);
  return res.json();
});

export default function ModelStatusBanner() {
  const { selectedModel, provider, isLoading } = useLLMConfig();
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const modalRef = React.useRef(null);

  const { data: statusData, error: statusError } = useSWR(
    LLM_STATUS_ENDPOINT,
    fetcher,
    {
      refreshInterval: POLL_INTERVAL_MS,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const status = React.useMemo(() => {
    if (statusError) {
      return { state: 'offline', activeProvider: null, isFailedOver: false, fallbackModel: null };
    }
    if (!statusData) {
      return { state: 'checking', activeProvider: null, isFailedOver: false, fallbackModel: null };
    }
    return {
      state: (statusData.primary_online || statusData.is_failed_over) ? 'online' : 'offline',
      activeProvider: statusData.active_provider,
      isFailedOver: statusData.is_failed_over,
      fallbackModel: statusData.fallback_model,
    };
  }, [statusData, statusError]);

  const isInLesson = pathname?.startsWith('/lessons/') && pathname !== '/lessons';

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

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
    router.push(isInLesson ? '/lessons' : '/lessons');
    setOpen(false);
  }

  const displayModel = status.isFailedOver ? status.fallbackModel : selectedModel;
  const displayProvider = status.isFailedOver ? 'anthropic' : provider;
  const statusOnline = status.state === 'online';

  const badgeClass = status.isFailedOver
    ? styles.backup
    : statusOnline
      ? styles.online
      : status.state === 'offline'
        ? styles.offline
        : styles.checking;

  const badgeLabel = status.state === 'checking'
    ? 'Connecting'
    : status.isFailedOver
      ? 'Backup'
      : statusOnline ? 'Online' : 'Offline';

  const badgeLabelLong = status.state === 'checking'
    ? 'Connecting…'
    : status.isFailedOver
      ? 'Backup active'
      : statusOnline ? 'Online' : 'Offline';

  return (
    <>
      <button className={styles.pill} onClick={() => setOpen(true)}>
        <span className={`${styles.pillBadge} ${badgeClass}`}>
          <span className={`${styles.pillDot} ${badgeClass}`} />
          {badgeLabel}
        </span>
        <span className={styles.pillModel}>{displayModel}</span>
        <span className={styles.pillSlash}>/</span>
        <span className={styles.pillProvider}>{PROVIDER_LABELS[displayProvider] ?? displayProvider}</span>
      </button>

      {open && (
        <div className={styles.overlay}>
          <div className={styles.modal} ref={modalRef} role="dialog" aria-modal="true" aria-label="AI tutor status">

            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Your AI tutor</span>
              <button className={styles.modalClose} onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>

            <div className={styles.modalBody}>
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

              <div className={styles.statusRow}>
                <div className={styles.statusRowLeft}>
                  <span className={styles.statusModel}>{displayModel}</span>
                  <span className={styles.statusMeta}>{PROVIDER_LABELS[displayProvider] ?? displayProvider}</span>
                </div>
                <span className={`${styles.statusBadge} ${badgeClass}`}>
                  <span className={`${styles.statusDot} ${badgeClass}`} />
                  {badgeLabelLong}
                </span>
              </div>

              {status.state === 'offline' && !status.isFailedOver && (
                <div className={styles.offlineNotice}>
                  The model is currently unreachable. Please check back later or{' '}
                  contact us if the issue persists!
                </div>
              )}

              {statusOnline && (
                <button className={styles.cta} onClick={handleCta}>
                  {isInLesson ? 'Back to lessons' : 'Go to lessons'}
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