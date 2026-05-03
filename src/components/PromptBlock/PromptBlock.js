"use client";

import React from "react";
import styles from "./PromptBlock.module.css";

export default function PromptBlock({ label, content, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={styles.promptBlock}>
      <button
        className={styles.promptToggle}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={styles.promptLabel}>{label}</span>
        <span className={`${styles.promptChevron} ${open ? styles.open : ""}`}>▾</span>
      </button>
      {open && <pre className={styles.promptPre}>{content}</pre>}
    </div>
  );
}