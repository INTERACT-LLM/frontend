import { useState, useCallback } from 'react';

export function useTabuGame(gameState) {
  const secret_word = gameState?.secret_word ?? null;
  const forbidden_words = gameState?.forbidden_words ?? [];

  const [violations, setViolations] = useState([]);
  const [guessed, setGuessed] = useState(false);
  const [guessNudge, setGuessNudge] = useState(false);

  const checkUserMessage = useCallback((text) => {
    if (!forbidden_words.length) return null;
    const lower = text.toLowerCase();
    const hit = forbidden_words.find(w => lower.includes(w.toLowerCase()));
    if (hit) {
      setViolations(prev => [...prev, hit]);
      return hit;
    }
    return null;
  }, [forbidden_words]);

  const checkLLMResponse = useCallback((text) => {
    if (!secret_word) return;
    if (text.toLowerCase().includes(secret_word.toLowerCase())) {
      setGuessNudge(true);
    }
  }, [secret_word]);

  const confirmGuess = useCallback(() => {
    setGuessed(true);
    setGuessNudge(false);
  }, []);

  const dismissNudge = useCallback(() => {
    setGuessNudge(false);
  }, []);

  return {
    secretWord: secret_word,
    forbiddenWords: forbidden_words,
    violations,
    guessed,
    guessNudge,
    checkUserMessage,
    checkLLMResponse,
    confirmGuess,
    dismissNudge,
  };
}