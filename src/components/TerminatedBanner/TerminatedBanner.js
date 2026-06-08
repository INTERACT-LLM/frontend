'use client';

import React from 'react';
import styles from './TerminatedBanner.module.css';

export default function TerminatedBanner({ isRestarting, onRestart }) {
  return (
    <div className={styles.banner} role="alert">
      <div className={styles.text}>
        <strong>Tutor offline.</strong>{' '}
        This conversation ended because the tutor model became unreachable.
      </div>
      <button
        className={styles.button}
        onClick={onRestart}
        disabled={isRestarting}
      >
        {isRestarting ? 'Starting…' : 'Start new conversation'}
      </button>
    </div>
  );
}