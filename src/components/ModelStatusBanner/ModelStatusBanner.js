'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useLLMConfig } from '@/context/LLMConfigContext';
import styles from './ModelStatusBanner.module.css';

const PROVIDER_LABELS = {
  ollama: 'Ollama',
  vllm:   'vLLM',
};

export default function ModelStatusBanner() {
  const { selectedModel, selectModel, availableModels, provider, isLoading } = useLLMConfig();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  const isInLesson = pathname?.startsWith('/lessons/');

  // Close popover when clicking outside
  React.useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (isLoading || !selectedModel || !provider) return null;

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={`${styles.banner} ${isInLesson ? styles.disabled : ''}`}
        onClick={() => !isInLesson && setOpen((o) => !o)}
        title={isInLesson ? 'Change model between lessons' : 'Change model'}
        disabled={isInLesson}
      >
        <span className={`${styles.dot} ${styles[provider]}`} />
        <span className={styles.text}>
          {selectedModel}
          <span className={styles.provider}> via {PROVIDER_LABELS[provider] ?? provider}</span>
        </span>
        {!isInLesson && <span className={styles.chevron}>{open ? '▲' : '▼'}</span>}
      </button>

      {open && !isInLesson && (
        <div className={styles.popover}>
          {availableModels.map((model) => (
            <button
              key={model}
              className={`${styles.option} ${model === selectedModel ? styles.active : ''}`}
              onClick={() => { selectModel(model); setOpen(false); }}
            >
              {model === selectedModel && <span className={styles.check}>✓</span>}
              {model}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}