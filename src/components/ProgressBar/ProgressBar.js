import React from 'react';
import styles from './ProgressBar.module.css';

export default function ProgressBar({ userTurns, minTurns }) {
    const progressPct = minTurns ? Math.min(100, Math.round((userTurns / minTurns) * 100)) : 0;

    return (
        <>
         {minTurns !== null && (
          <div className={styles.progressRow}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={styles.progressLabel}>
              {userTurns} / {minTurns} turns
            </span>
          </div>
        )}
        </>
    )
}