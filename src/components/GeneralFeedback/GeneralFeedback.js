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

  const positiveFeedback = feedback.positive || '';
  const improvementsFeedback = feedback.improvements || '';

  console.log('GeneralFeedback received:', { positiveFeedback, improvementsFeedback });

  const lines = [];
  if (positiveFeedback) {
    lines.push(`Positive: ${positiveFeedback}`);
  }
  if (improvementsFeedback) {
    lines.push(`Improvements: ${improvementsFeedback}`);
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