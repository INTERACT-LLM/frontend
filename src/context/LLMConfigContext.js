'use client';

import React from 'react';
import useSWR from 'swr';

const LLM_MODELS_ENDPOINT = '/api/llm/models';
const fetcher = (url) => fetch(url).then((res) => res.json());

const LLMConfigContext = React.createContext(null);

export function LLMConfigProvider({ children }) {
  const { data, isLoading } = useSWR(LLM_MODELS_ENDPOINT, fetcher);

  return (
    <LLMConfigContext.Provider value={{
      selectedModel: data?.default_model ?? null,
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