'use client';

import React from 'react';
import styles from './TabuPane.module.css';

export default function TabuPane({
  secretWord,
  forbiddenWords,
  violations,
  guessed,
  guessNudge,
  onConfirmGuess,
  onDismissNudge,
}) {
  if (!secretWord) return null;

  return (
    <div className={`${styles.pane} ${guessed ? styles.paneGuessed : ''}`}>
      <div className={styles.section}>
        <span className={styles.label}>Secret word</span>
        <span className={`${styles.secretWord} ${guessed ? styles.secretWordGuessed : ''}`}>
          {secretWord}
        </span>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <span className={styles.label}>Forbidden words</span>
        <ul className={styles.forbiddenList}>
          {forbiddenWords.map((word) => {
            const violated = violations.includes(word);
            return (
              <li key={word} className={`${styles.forbiddenWord} ${violated ? styles.violated : ''}`}>
                {violated && <span className={styles.strikeIcon}>🚫</span>}
                <span className={styles.wordText}>{word}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {violations.length > 0 && (
        <div className={styles.violationCount}>
          {violations.length} violation{violations.length !== 1 ? 's' : ''}
        </div>
      )}

      <div className={styles.divider} />

      {guessed ? (
        <div className={styles.guessedBanner}>
          🎉 ¡Palabra adivinada!
        </div>
      ) : guessNudge ? (
        <div className={styles.nudge}>
          <span className={styles.nudgeText}>🎯 Did the tutor guess it?</span>
          <div className={styles.nudgeButtons}>
            <button className={styles.confirmBtn} onClick={onConfirmGuess}>✅ Yes!</button>
            <button className={styles.dismissBtn} onClick={onDismissNudge}>❌ No</button>
          </div>
        </div>
      ) : (
        <button className={styles.manualConfirm} onClick={onConfirmGuess}>
          ✅ Tutor guessed it!
        </button>
      )}
    </div>
  );
}