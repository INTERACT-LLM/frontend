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

  const positive = Array.isArray(feedback.positive) ? feedback.positive : [];
  const improvements = Array.isArray(feedback.improvements) ? feedback.improvements : [];

  return (
    <div className={styles.feedbackWrapper}>
      <FeedbackSection title="What you did well" items={positive} variant="positive" />
      <FeedbackSection title="Suggestions for improvement" items={improvements} variant="improvements" />
    </div>
  );
}

// would normally place diff. components in their own folder,
// but since this will only be used internally in this comp for now, I have kept it here!
function FeedbackSection({ title, items, variant }) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`${styles.section} ${styles[variant]}`}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>
          {variant === 'positive' ? '✦' : '→'}
        </span>
        <h3 className={styles.sectionTitle}>{title}</h3>
      </div>
      <ul className={styles.feedbackList}>
        {items.map((item, i) => (
          <li key={i} className={styles.feedbackItem}>
            <span className={styles.dot} />
            <span dangerouslySetInnerHTML={{ __html: item.replace(/<<(.+?)>>/g, '<em class="targetLang">$1</em>') }} />
          </li>
        ))}
      </ul>
    </div>
  );
}