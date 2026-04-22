'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './CompletionWindow.module.css';
import GeneralFeedback from '@/components/GeneralFeedback/GeneralFeedback';

export default function CompletionWindow({ lessonId, userTurns, detailedFeedback }) {
  const router = useRouter();

  return (
    <div className={styles.completionWrapper}>
      <div className={styles.completionCard}>

        <div className={styles.completionBadge}>Complete</div>
        <h2 className={styles.completionTitle}>{lessonId.toUpperCase()}</h2>
        <p className={styles.completionStat}>
          {userTurns} turn{userTurns !== 1 ? 's' : ''} completed
        </p>

        <div className={styles.divider} />

        <div className={styles.feedbackSection}>
          <p className={styles.feedbackHeading}>Lesson feedback</p>
          <GeneralFeedback feedback={detailedFeedback} />
        </div>

        <button className={styles.returnButton} onClick={() => router.push('/lessons')}>
          ← Return to lessons
        </button>
      </div>
    </div>
  );
}