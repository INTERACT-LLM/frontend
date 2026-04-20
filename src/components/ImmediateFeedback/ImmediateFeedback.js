import React from 'react';
import styles from './ImmediateFeedback.module.css';

export default function ImmediateFeedback({ feedback }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className={styles.immediateFeedback}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.feedbackToggle}>
        {isOpen ? 'Hide feedback' : 'Show feedback'}
      </button>
      {isOpen && (
        <div className={styles.feedbackBody}>
          <p className={styles.feedbackCorrected}>{feedback.corrected_text}</p>
          <p className={styles.feedbackExplanation}>{feedback.english_error_explanation}</p>
        </div>
      )}
    </div>
  );
}