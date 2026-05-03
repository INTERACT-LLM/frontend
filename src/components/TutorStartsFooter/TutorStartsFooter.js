"use client";

import React from "react";
import styles from "./TutorStartsFooter.module.css";

export default function TutorStartsFooter({ onClose, onStart, startLabel = "Start →" }) {
  const [tutorStarts, setTutorStarts] = React.useState(false);

  return (
    <>
      <div className={styles.tutorToggle}>
        <span className={styles.tutorToggleLabel}>
          {tutorStarts ? "Tutor starts" : "You start"}
        </span>
        <button
          role="switch"
          aria-checked={tutorStarts}
          className={`${styles.toggle} ${tutorStarts ? styles.toggleOn : ""}`}
          onClick={() => setTutorStarts((prev) => !prev)}
        />
      </div>
      <div className={styles.buttons}>
        <button className={styles.btnGhost} onClick={onClose}>Not now</button>
        <button className={styles.btnPrimary} onClick={() => onStart(tutorStarts)}>
          {startLabel}
        </button>
      </div>
    </>
  );
}