'use client';

import { useLLMConfig } from '@/context/LLMConfigContext';
import styles from './ModelStatusBanner.module.css';

const PROVIDER_LABELS = {
  ollama: 'Ollama',
  vllm:   'vLLM',
};

export default function ModelStatusBanner() {
  const { selectedModel, provider, isLoading } = useLLMConfig();

  if (isLoading || !selectedModel || !provider) return null;

  return (
    <div className={styles.banner} title={`Provider: ${provider}`}>
      <span className={`${styles.dot} ${styles[provider]}`} />
      <span className={styles.text}>
        {selectedModel}
        <span className={styles.provider}> via {PROVIDER_LABELS[provider] ?? provider}</span>
      </span>
    </div>
  );
}