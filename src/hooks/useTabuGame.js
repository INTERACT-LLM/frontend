import React from 'react';

export function useTabuGame(gameState) {
  const [violations, setViolations] = React.useState([]);
  const [guessed, setGuessed] = React.useState(false);
  const [guessNudge, setGuessNudge] = React.useState(false);

  const checkUserMessage = React.useCallback((text) => {
    const forbidden_words = gameState?.forbidden_words ?? [];
    if (!forbidden_words.length) return null;
    const lower = text.toLowerCase();
    const hit = forbidden_words.find(w => lower.includes(w.toLowerCase()));
    if (hit) {
      setViolations(prev => [...prev, hit]);
      return hit;
    }
    return null;
  }, [gameState]);

  const checkLLMResponse = React.useCallback((text) => {
    const secret_word = gameState?.secret_word;
    if (!secret_word) return;
    if (text.toLowerCase().includes(secret_word.toLowerCase())) {
      setGuessNudge(true);
    }
  }, [gameState]);

  const confirmGuess = React.useCallback(() => {
    setGuessed(true);
    setGuessNudge(false);
  }, []);

  const dismissNudge = React.useCallback(() => {
    setGuessNudge(false);
  }, []);

  return {
    secretWord: gameState?.secret_word ?? null,
    forbiddenWords: gameState?.forbidden_words ?? [],
    violations,
    guessed,
    guessNudge,
    checkUserMessage,
    checkLLMResponse,
    confirmGuess,
    dismissNudge,
  };
}