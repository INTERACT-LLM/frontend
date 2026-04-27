'use client';

import React from 'react';
import useSWR from 'swr';

const STORAGE_KEY = 'llm_selected_model';
const LLM_MODELS_ENDPOINT = '/api/llm/models';

const fetcher = (url) => fetch(url).then((res) => res.json());

const LLMConfigContext = React.createContext(null);

export function LLMConfigProvider({ children }) {
  const { data, isLoading } = useSWR(LLM_MODELS_ENDPOINT, fetcher);

  const [selectedModel, setSelectedModel] = React.useState(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY) || null;
  });

  // Validate stored model against current provider's available models
  React.useEffect(() => {
    if (!data) return;
    const available = data.models ?? [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored || !available.includes(stored)) {
      const fallback = data.default_model ?? available[0] ?? null;
      setSelectedModel(fallback);
      if (fallback) localStorage.setItem(STORAGE_KEY, fallback);
    }
  }, [data]);

  function selectModel(model) {
    setSelectedModel(model);
    localStorage.setItem(STORAGE_KEY, model);
  }

  return (
    <LLMConfigContext.Provider value={{
      selectedModel,
      selectModel,
      availableModels: data?.models ?? [],
      provider: data?.provider ?? null,
      isLoading,
    }}>
      {children}
    </LLMConfigContext.Provider>
  );
}

export function useLLMConfig() {
  const ctx = React.useContext(LLMConfigContext);
  if (!ctx) throw new Error('useLLMConfig must be used within a LLMConfigProvider');
  return ctx;
}