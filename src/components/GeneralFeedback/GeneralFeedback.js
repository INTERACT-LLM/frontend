'use client';

import React from 'react';
import styles from './GeneralFeedback.module.css';

export default function GeneralFeedback({ feedback }) {
  if (!feedback) {
    return (
      <div className={styles.loadingRow}>
        <span className={styles.spinner} />
        <span className={styles.loadingText}>Generating feedback…</span>
      </div>
    );
  }

  const lines = feedback
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return <p className={styles.feedbackPara}>{feedback}</p>;
  }

  return (
    <ul className={styles.feedbackList}>
      {lines.map((line, i) => {
        const clean = line.replace(/^(\d+\.|[-•])\s*/, '');
        return (
          <li key={i} className={styles.feedbackItem}>
            <span className={styles.dot} />
            <span>{clean}</span>
          </li>
        );
      })}
    </ul>
  );
}