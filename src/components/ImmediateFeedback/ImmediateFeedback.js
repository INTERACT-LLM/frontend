import React from 'react';
import styles from './ImmediateFeedback.module.css';

export default function ImmediateFeedback({ feedback }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const hasCorrected = feedback?.corrected_text;
  const hasExplanation = feedback?.english_error_explanation;

  // if it passes the has_error check, it should have at least one of these, but just in case, we won't render anything if both are missing
  if (!hasCorrected && !hasExplanation) return null;

  return (
    <div className={styles.immediateFeedback}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.feedbackToggle}>
        {isOpen ? 'Hide feedback' : 'Show feedback'}
      </button>
      {isOpen && (
        <div className={styles.feedbackBody}>
          {hasCorrected && <p className={styles.feedbackCorrected}>{feedback.corrected_text}</p>}
          {hasExplanation && <p className={styles.feedbackExplanation}>{feedback.english_error_explanation}</p>}
        </div>
      )}
    </div>
  );
}