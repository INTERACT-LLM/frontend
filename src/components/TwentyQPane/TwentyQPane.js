'use client';

import React from 'react';
import styles from './TwentyQPane.module.css';

export default function TwentyQPane({
  secretConcept,
  questionCount,
  maxQuestions = 20,
  gameOver,        // true once questionCount === maxQuestions
  result,          // null | 'won' | 'lost'
  hasAssistantResponded,
  onGuessedIt,     // user pressed "I guessed it!" or "Yes!" at end screen
  onGaveUp,        // user pressed "No..." at end screen
}) {
  if (!secretConcept) return null;

  const pct = Math.round((questionCount / maxQuestions) * 100);
  const progressClass =
    pct >= 100 ? styles.progressDanger :
    pct >= 70  ? styles.progressWarning :
                 styles.progressNeutral;

  if (result === 'won') {
    return (
      <div className={styles.pane}>
        <div className={styles.wonBanner}>You got it!</div>
        <div className={styles.reveal}>
          The concept was <strong>{secretConcept}</strong>
        </div>
      </div>
    );
  }

  if (result === 'lost') {
    return (
      <div className={styles.pane}>
        <div className={styles.lostBanner}>Better luck next time</div>
        <div className={styles.reveal}>
          The concept was <strong>{secretConcept}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pane}>
      <div className={styles.section}>
        <span className={styles.label}>Questions used</span>
        <div className={styles.counter}>
          {questionCount}<span> / {maxQuestions}</span>
        </div>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={`${styles.progressFill} ${progressClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className={styles.divider} />

      {gameOver ? (
        <div className={styles.endScreen}>
          <div className={styles.endTitle}>20 questions used!</div>
          <div className={styles.endSub}>Did you guess the concept?</div>
          <div className={styles.btnRow}>
            <button className={styles.btnYes} onClick={onGuessedIt}>Yes!</button>
            <button className={styles.btnNo}  onClick={onGaveUp}>No...</button>
          </div>
        </div>
      ) : (
        <span
          className={styles.tooltipWrapper}
          data-tooltip={
            !hasAssistantResponded
              ? 'Ask at least one question first'
              : 'Press if you figured it out'
          }
        >
          <button
            className={styles.guessedBtn}
            onClick={onGuessedIt}
            disabled={!hasAssistantResponded}
          >
            I guessed it!
          </button>
        </span>
      )}
    </div>
  );
}