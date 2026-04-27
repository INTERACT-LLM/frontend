import React from 'react';

export function useTwentyQGame(gameState) {
  const [result, setResult] = React.useState(null); // null | 'won' | 'lost'

  const secretWord = gameState?.secret_word ?? null;
  const maxQuestions = gameState?.max_questions ?? 20;

  return {
    secretWord,
    maxQuestions,
    result,
    confirmGuess: () => setResult('won'),
    gaveUp: () => setResult('lost'),
  };
}