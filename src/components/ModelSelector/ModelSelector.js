'use client';

import { useLLMConfig } from '@/context/LLMConfigContext';
import styles from './ModelSelector.module.css';

export default function ModelSelector() {
  const { selectedModel, selectModel, availableModels, isLoading } = useLLMConfig();

  if (isLoading || availableModels.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="model-select">Model</label>
      <select
        id="model-select"
        className={styles.select}
        value={selectedModel ?? ''}
        onChange={(e) => selectModel(e.target.value)}
      >
        {availableModels.map((model) => (
          <option key={model} value={model}>{model}</option>
        ))}
      </select>
    </div>
  );
}